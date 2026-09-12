export interface ParsedCardData {
  name: string;
  company: string;
  title: string;
  phone: string;
  whatsApp: string;
  email: string;
  website: string;
  address: string;
  notes: string;
  rawText: string;
}

// Common job designations on business cards
const JOB_TITLE_REGEX = /\b(CEO|CTO|CFO|COO|Managing\s+Director|Director|Partner|Founder|Co-Founder|President|Vice\s+President|VP|Territory\s+Manager|General\s+Manager|Manager|Lead|Head|Consultant|Specialist|Representative|Executive|Associate|Engineer|Architect|Analyst|Advisor|Supervisor)\b/i;

// Words commonly indicating corporate entity
const COMPANY_INDICATORS = /\b(Ltd|Limited|Pvt|Private|Inc|Incorporated|Corp|Corporation|LLC|LLP|Technologies|Technology|Solutions|Health\s+Science|Enterprises|Enterprises\s+Ltd|Industries|Infotech|Group|Ventures|Labs|Studio|Services|Agency|Hospital|Pharma|Healthcare)\b/i;

// Words to ignore when detecting person name
const NON_NAME_WORDS = /\b(tel|phone|mobile|cell|fax|email|mail|web|website|http|https|www|road|rd|street|st|lane|avenue|ave|floor|block|sector|nagar|bazaar|plot|box|pin|pincode|po|hyderabad|mumbai|delhi|bengaluru|bangalore|chennai|kolkata|pune|gurgaon|noida|ahmedabad|india|usa|uk|canada|germany|texas|california|singapore)\b/i;

export function parseBusinessCardText(rawText: string): ParsedCardData {
  const cleanRaw = rawText.replace(/\r\n/g, "\n");
  const rawLines = cleanRaw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  let email = "";
  let website = "";
  let phone = "";
  let whatsApp = "";
  let name = "";
  let company = "";
  let title = "";
  const addressParts: string[] = [];
  const candidateNames: string[] = [];

  // 1. First Pass: Emails, URLs, Phone Numbers
  for (const line of rawLines) {
    // Check Email
    if (!email) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        email = emailMatch[0].toLowerCase();
      }
    }

    // Check Website
    if (!website) {
      const webMatch = line.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
      if (webMatch) {
        website = webMatch[0];
      }
    }

    // Check Mobile / WhatsApp (Prefers lines with M:, Mob:, Cell: or standard 10+ digits)
    const mobilePrefixMatch = line.match(/(?:(?:M|Mob|Mobile|Cell|WhatsApp|WA)[\s.:/–-]+)([+\d\s().-]{10,20})/i);
    if (mobilePrefixMatch && !whatsApp) {
      const cleaned = cleanPhoneNumber(mobilePrefixMatch[1]);
      if (cleaned.length >= 10) {
        whatsApp = cleaned;
        if (!phone) phone = cleaned;
      }
    }

    // Check Generic Phone / Tel
    const telPrefixMatch = line.match(/(?:(?:T|Tel|Phone|Ph|Office)[\s.:/–-]+)([+\d\s().-]{10,20})/i);
    if (telPrefixMatch && !phone) {
      const cleaned = cleanPhoneNumber(telPrefixMatch[1]);
      if (cleaned.length >= 10) {
        phone = cleaned;
      }
    }

    // Check for raw standalone phone patterns if not found yet
    if (!phone && !whatsApp) {
      const standalonePhone = line.match(/(?:\+91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}|(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
      if (standalonePhone) {
        const cleaned = cleanPhoneNumber(standalonePhone[0]);
        if (cleaned.length >= 10) {
          phone = cleaned;
          whatsApp = cleaned;
        }
      }
    }
  }

  // 2. Second Pass: Title & Company detection
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check for Title
    if (!title && JOB_TITLE_REGEX.test(line)) {
      title = line;
      // In business cards, person's name is almost always the line immediately above or below the title!
      if (i > 0) {
        const prevLine = rawLines[i - 1];
        if (isValidPersonName(prevLine)) {
          name = prevLine;
        }
      }
    }

    // Check for Company Name
    if (!company && COMPANY_INDICATORS.test(line)) {
      company = line;
    }

    // Collect address lines (contains pin/zip, road, city, or commas with numbers)
    if (line.match(/\b\d{6}\b/) || line.match(/(?:road|street|nagar|floor|block|city|india|telangana|delhi|mumbai|bangalore|hyderabad)/i)) {
      addressParts.push(line);
    }

    // Collect candidate name lines
    if (isValidPersonName(line)) {
      candidateNames.push(line);
    }
  }

  // 3. Fallback for Name if not deduced by Job Title
  if (!name && candidateNames.length > 0) {
    // Pick the first candidate name that isn't the company name
    const found = candidateNames.find((c) => c !== company);
    if (found) {
      name = found;
    }
  }

  // 4. Fallback for Company from Email Domain if not found
  if (!company && email) {
    const domain = email.split("@")[1];
    if (domain && !domain.includes("gmail") && !domain.includes("yahoo") && !domain.includes("outlook") && !domain.includes("hotmail")) {
      const domainName = domain.split(".")[0];
      company = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    }
  }

  // 5. Fallback for Company from top header lines
  if (!company && rawLines.length > 0) {
    const firstLine = rawLines[0];
    if (!isValidPersonName(firstLine) && firstLine.length > 3 && !firstLine.includes("@") && !firstLine.match(/^\+?\d/)) {
      company = firstLine;
    }
  }

  // If still no WhatsApp but phone exists
  if (!whatsApp && phone) {
    whatsApp = phone;
  }
  if (!phone && whatsApp) {
    phone = whatsApp;
  }

  // Assemble notes from remaining useful details
  const notesLines: string[] = [];
  if (title) notesLines.push(`Designation: ${title}`);
  if (website) notesLines.push(`Website: ${website}`);
  if (addressParts.length > 0) notesLines.push(`Address: ${addressParts.join(", ")}`);

  return {
    name: name.trim(),
    company: company.trim(),
    title: title.trim(),
    phone: phone.trim(),
    whatsApp: whatsApp.trim(),
    email: email.trim(),
    website: website.trim(),
    address: addressParts.join(", ").trim(),
    notes: notesLines.join("\n").trim(),
    rawText: rawLines.join("\n"),
  };
}

function cleanPhoneNumber(str: string): string {
  const digits = str.replace(/[^\d+]/g, "");
  // If formatted like +91..., retain it
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return str.trim();
}

function isValidPersonName(str: string): boolean {
  const trimmed = str.trim();
  if (trimmed.length < 3 || trimmed.length > 40) return false;
  if (trimmed.includes("@") || trimmed.includes("http") || trimmed.includes("www")) return false;
  if (/\d/.test(trimmed)) return false;
  if (NON_NAME_WORDS.test(trimmed)) return false;
  if (COMPANY_INDICATORS.test(trimmed)) return false;

  // Most personal names are 2 to 4 words (e.g. "Shubham Sharma", "Dr. Amit Verma")
  const words = trimmed.split(/\s+/);
  return words.length >= 1 && words.length <= 4;
}
