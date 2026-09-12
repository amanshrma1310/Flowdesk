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
const JOB_TITLE_REGEX = /\b(CEO|CTO|CFO|COO|Managing\s+Director|Director|Partner|Founder|Co-Founder|President|Vice\s+President|VP|Territory\s+Manager|General\s+Manager|Regional\s+Manager|Branch\s+Manager|Sales\s+Manager|Marketing\s+Manager|Project\s+Manager|Manager|Lead|Head|Consultant|Specialist|Representative|Executive|Associate|Engineer|Architect|Analyst|Advisor|Supervisor|Officer)\b/i;

// Words commonly indicating corporate entity
const COMPANY_INDICATORS = /\b(Ltd|Limited|Pvt|Private|Inc|Incorporated|Corp|Corporation|LLC|LLP|Technologies|Technology|Solutions|Health\s+Science|Enterprises|Enterprises\s+Ltd|Industries|Infotech|Group|Ventures|Labs|Studio|Services|Agency|Hospital|Pharma|Healthcare|Systems|Software|Holdings|Trading|Associates)\b/i;

// Words to ignore when detecting person name
const NON_NAME_WORDS = /\b(tel|phone|mobile|cell|fax|email|mail|web|website|http|https|www|road|rd|street|st|lane|avenue|ave|floor|block|sector|nagar|bazaar|plot|box|pin|pincode|po|hyderabad|mumbai|delhi|bengaluru|bangalore|chennai|kolkata|pune|gurgaon|noida|ahmedabad|jaipur|lucknow|chandigarh|india|usa|uk|canada|germany|texas|california|singapore|dubai|uae)\b/i;

export function parseBusinessCardText(rawText: string): ParsedCardData {
  if (!rawText || !rawText.trim()) {
    return {
      name: "",
      company: "",
      title: "",
      phone: "",
      whatsApp: "",
      email: "",
      website: "",
      address: "",
      notes: "",
      rawText: "",
    };
  }

  const cleanRaw = rawText.replace(/\r\n/g, "\n");
  const rawLines = cleanRaw
    .split("\n")
    .map((l) => l.trim())
    .map((l) => l.replace(/^[^a-zA-Z0-9+@#]+|[^a-zA-Z0-9.)]+$/g, "").trim()) // clean stray OCR symbols like | or -
    .filter((l) => l.length > 0);

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
    // Check Email (allows optional spaces introduced by OCR: "user @ domain . com")
    if (!email) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/);
      if (emailMatch) {
        email = emailMatch[0].replace(/\s+/g, "").toLowerCase();
      }
    }

    // Check Website
    if (!website) {
      const webMatch = line.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
      if (webMatch) {
        website = webMatch[0].replace(/\s+/g, "");
      }
    }

    // Check Mobile / WhatsApp (Prefers lines with M:, Mob:, Cell: or standard 10+ digits)
    const mobilePrefixMatch = line.match(/(?:(?:M|Mob|Mobile|Cell|WhatsApp|WA|Call)[\s.:/–-]+)([+\d\s().-]{10,20})/i);
    if (mobilePrefixMatch && !whatsApp) {
      const cleaned = cleanPhoneNumber(mobilePrefixMatch[1]);
      if (cleaned.length >= 10) {
        whatsApp = cleaned;
        if (!phone) phone = cleaned;
      }
    }

    // Check Generic Phone / Tel
    const telPrefixMatch = line.match(/(?:(?:T|Tel|Phone|Ph|Office|Contact)[\s.:/–-]+)([+\d\s().-]{10,20})/i);
    if (telPrefixMatch && !phone) {
      const cleaned = cleanPhoneNumber(telPrefixMatch[1]);
      if (cleaned.length >= 10) {
        phone = cleaned;
      }
    }

    // Check for raw standalone phone patterns if not found yet
    if (!phone && !whatsApp) {
      // Indian 10-digit mobile starting with 6,7,8,9, with optional +91 or 0
      const standaloneIndian = line.match(/(?:\+91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}|(?:\+91[\s.-]?)?[6-9]\d{9}/);
      if (standaloneIndian) {
        const cleaned = cleanPhoneNumber(standaloneIndian[0]);
        if (cleaned.length >= 10) {
          phone = cleaned;
          whatsApp = cleaned;
        }
      } else {
        // International or landline
        const intlMatch = line.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
        if (intlMatch) {
          const cleaned = cleanPhoneNumber(intlMatch[0]);
          if (cleaned.length >= 10) {
            phone = cleaned;
            whatsApp = cleaned;
          }
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
      // In business cards, person's name is almost always the line immediately above OR below the title!
      if (i > 0 && isValidPersonName(rawLines[i - 1])) {
        name = cleanPersonName(rawLines[i - 1]);
      } else if (i < rawLines.length - 1 && isValidPersonName(rawLines[i + 1])) {
        name = cleanPersonName(rawLines[i + 1]);
      }
    }

    // Check for Company Name
    if (!company && COMPANY_INDICATORS.test(line)) {
      company = cleanCompanyName(line);
    }

    // Collect address lines (contains pin/zip, road, city, or commas with numbers)
    if (line.match(/\b\d{6}\b/) || line.match(/(?:road|street|nagar|floor|block|city|india|telangana|delhi|mumbai|bangalore|hyderabad|pune|chennai)/i)) {
      if (!line.includes("@") && !COMPANY_INDICATORS.test(line)) {
        addressParts.push(line);
      }
    }

    // Collect candidate name lines
    if (isValidPersonName(line)) {
      candidateNames.push(cleanPersonName(line));
    }
  }

  // 3. Fallback for Name if not deduced by Job Title
  if (!name && candidateNames.length > 0) {
    // Pick the first candidate name that isn't the company name and not in address
    const found = candidateNames.find(
      (c) => c.toLowerCase() !== company.toLowerCase() && !addressParts.some((a) => a.includes(c))
    );
    if (found) {
      name = found;
    }
  }

  // 4. Fallback for Company from Email Domain if not found
  if (!company && email) {
    const domain = email.split("@")[1];
    if (domain && !domain.includes("gmail") && !domain.includes("yahoo") && !domain.includes("outlook") && !domain.includes("hotmail")) {
      const domainName = domain.split(".")[0];
      if (domainName && domainName.length > 2) {
        company = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
    }
  }

  // 5. Fallback for Company from top header lines
  if (!company && rawLines.length > 0) {
    const firstLine = rawLines[0];
    if (!isValidPersonName(firstLine) && firstLine.length > 3 && !firstLine.includes("@") && !firstLine.match(/^\+?\d/)) {
      company = cleanCompanyName(firstLine);
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

function cleanPersonName(str: string): string {
  return str
    .replace(/^[^a-zA-Z]+|[^a-zA-Z.]+$/g, "") // strip leading/trailing OCR artifacts
    .trim();
}

function cleanCompanyName(str: string): string {
  return str
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.)]+$/g, "")
    .trim();
}

function cleanPhoneNumber(str: string): string {
  const digits = str.replace(/[^\d+]/g, "");
  // Retain already formatted international
  if (digits.startsWith("+")) {
    if (digits.startsWith("+91") && digits.length === 13) {
      return `+91 ${digits.slice(3, 8)} ${digits.slice(8)}`;
    }
    return digits;
  }
  // 10 digits Indian mobile (starts with 6,7,8,9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  // 11 digits starting with 0
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) {
    return `+91 ${digits.slice(1, 6)} ${digits.slice(6)}`;
  }
  // 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  // Standard 10 digit generic
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return str.trim();
}

function isValidPersonName(str: string): boolean {
  const cleaned = cleanPersonName(str);
  if (cleaned.length < 3 || cleaned.length > 40) return false;
  if (cleaned.includes("@") || cleaned.includes("http") || cleaned.includes("www")) return false;
  if (/\d/.test(cleaned)) return false;
  if (NON_NAME_WORDS.test(cleaned)) return false;
  if (COMPANY_INDICATORS.test(cleaned)) return false;

  // Personal names usually 1 to 4 words (e.g. "Shubham Sharma", "Dr. Amit Verma")
  const words = cleaned.split(/\s+/);
  return words.length >= 1 && words.length <= 4;
}
