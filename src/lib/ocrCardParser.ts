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
    .map((l) => l.replace(/^[^a-zA-Z0-9+@#]+|[^a-zA-Z0-9.)]+$/g, "").trim())
    .filter((l) => l.length > 0);

  let email = "";
  let website = "";
  let mobilePhone = "";
  let officePhone = "";
  let phone = "";
  let whatsApp = "";
  let name = "";
  let company = "";
  let title = "";
  const addressParts: string[] = [];
  const candidateNames: string[] = [];

  // -------------------------------------------------------------
  // 1. FIRST PASS: Extract Website & Domain
  // -------------------------------------------------------------
  for (const line of rawLines) {
    if (!website) {
      const webMatch = line.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
      if (webMatch) {
        website = webMatch[0].replace(/^[^\w]+/, "").toLowerCase();
      }
    }
  }

  // Extract root domain (e.g. "drreddysnestle.com")
  const knownDomain = website
    ? website.replace(/^(?:https?:\/\/)?(?:www\.)?/, "").split("/")[0].toLowerCase()
    : "";

  // -------------------------------------------------------------
  // 2. SECOND PASS: Resilient Email Extraction
  // Solves OCR misreading '@' as '©', '®', '(c)', '(a)', spaces,
  // or '.com' as ',com' / '.corn' / ' com'.
  // -------------------------------------------------------------
  for (const line of rawLines) {
    if (email) break;

    // Skip pure website lines without email indicators
    if (/^(?:https?:\/\/|www\.)/i.test(line) && !line.includes("@") && !line.includes("©")) {
      continue;
    }

    // A. Standard well-formed email
    const standardMatch = line.match(/[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/i);
    if (standardMatch) {
      const candidate = standardMatch[0].replace(/\s+/g, "").toLowerCase();
      if (!candidate.startsWith("www.") && !candidate.includes("@www.")) {
        email = cleanEmail(candidate);
        break;
      }
    }

    // B. OCR corrupted '@' character repair: ©, ®, (c), (a), [at], or spaces
    const normalized = line
      .replace(/[©®]/g, "@")
      .replace(/\s*\((?:c|a)\)\s*/gi, "@")
      .replace(/\s*\[at\]\s*/gi, "@")
      .replace(/\s*@\s*/g, "@")
      .replace(/\s*\.\s*/g, ".")
      .replace(/[,.\s]\s*(com|in|org|net|co|io|biz|info)\b/gi, (_, tld) => "." + tld)
      .replace(/\.(corn|c0m)\b/gi, ".com");

    const repairedMatch = normalized.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    if (repairedMatch) {
      const candidate = repairedMatch[0].replace(/\s+/g, "").toLowerCase();
      if (!candidate.startsWith("www.") && !candidate.includes("@www.")) {
        email = cleanEmail(candidate);
        break;
      }
    }

    // C. Explicit Email/Mail prefix (e.g. "E: shubham.sharma drreddysnestle.com" or "Email: ...")
    const prefixMatch = line.match(/(?:(?:E|Email|Mail|E-mail|e-mail|EMail)[\s.:/–-]+)([^\s]+(?:\s+[^\s]+)?)/i);
    if (prefixMatch) {
      let candidate = prefixMatch[1].trim();
      candidate = candidate
        .replace(/[©®]/g, "@")
        .replace(/\s*\((?:c|a)\)\s*/gi, "@")
        .replace(/[,.\s]\s*(com|in|org|net|co|io|biz|info)\b/gi, (_, tld) => "." + tld);

      if (candidate.includes("@")) {
        email = cleanEmail(candidate.replace(/\s+/g, ""));
        break;
      } else if (candidate.includes(".com") || candidate.includes(".in") || (knownDomain && candidate.includes(knownDomain))) {
        const parts = candidate.split(/[\s.]+/);
        if (parts.length >= 2) {
          const userPart = parts[0] + (parts.length > 2 ? "." + parts[1] : "");
          email = cleanEmail(`${userPart}@${knownDomain || parts.slice(-2).join(".")}`);
          break;
        }
      }
    }

    // D. Domain-matched email without '@' (e.g. "shubham.sharma drreddysnestle.com")
    if (knownDomain && line.toLowerCase().includes(knownDomain)) {
      const lineLower = line.toLowerCase();
      if (!lineLower.startsWith("www.") && !lineLower.startsWith("http")) {
        const userMatch = line.match(/([a-zA-Z0-9._-]+)[\s@©®:;/_.-]+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (userMatch) {
          const u = userMatch[1].replace(/^[^a-zA-Z0-9]+|\.+$/g, "").replace(/\s+/g, ".").toLowerCase();
          const d = userMatch[2].toLowerCase();
          if (u.length >= 3 && !u.startsWith("www") && !d.startsWith("www.")) {
            email = cleanEmail(`${u}@${d}`);
            break;
          }
        }
      }
    }

    // E. General pattern: word.word domain.tld (e.g. "shubham.sharma domain.com")
    const generalEmailMatch = line.match(/([a-zA-Z0-9._-]+)[\s@©®:;/-]+([a-zA-Z0-9-]+\.(?:com|in|org|net|co|io|biz|info))\b/i);
    if (generalEmailMatch) {
      const u = generalEmailMatch[1].replace(/^[^a-zA-Z0-9]+|\.+$/g, "").replace(/\s+/g, ".").toLowerCase();
      const d = generalEmailMatch[2].toLowerCase();
      if (u.length >= 3 && !u.startsWith("www") && !d.startsWith("www.")) {
        email = cleanEmail(`${u}@${d}`);
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 3. THIRD PASS: Phone Numbers with Mobile Priority
  // Mobile numbers (M:, Mob:, WhatsApp) take precedence over landlines (T:)
  // -------------------------------------------------------------
  for (const line of rawLines) {
    // Check for Mobile / WhatsApp specifically
    const mobilePrefixMatch = line.match(/(?:(?:M|Mob|Mobile|Cell|WhatsApp|WA|Call)[\s.:/–-]+)([+\d\s().-]{10,22})/i);
    if (mobilePrefixMatch && !mobilePhone) {
      const cleaned = cleanPhoneNumber(mobilePrefixMatch[1]);
      if (cleaned.length >= 10) {
        mobilePhone = cleaned;
      }
    }

    // Check for Generic Tel / Landline / Office
    const telPrefixMatch = line.match(/(?:(?:T|Tel|Phone|Ph|Office|Contact|Landline)[\s.:/–-]+)([+\d\s().-]{10,22})/i);
    if (telPrefixMatch && !officePhone) {
      const cleaned = cleanPhoneNumber(telPrefixMatch[1]);
      if (cleaned.length >= 10) {
        officePhone = cleaned;
      }
    }

    // Check for Indian 10-digit mobile starting with 6,7,8,9
    if (!mobilePhone) {
      const indianMobile = line.match(/(?:\+?91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}|(?:\+?91[\s.-]?)?[6-9]\d{9}/);
      if (indianMobile) {
        const cleaned = cleanPhoneNumber(indianMobile[0]);
        if (cleaned.length >= 10) {
          mobilePhone = cleaned;
        }
      }
    }

    // International or landline if neither found
    if (!mobilePhone && !officePhone) {
      const intlMatch = line.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
      if (intlMatch) {
        const cleaned = cleanPhoneNumber(intlMatch[0]);
        if (cleaned.length >= 10) {
          officePhone = cleaned;
        }
      }
    }
  }

  // Assign primary phone: Mobile ALWAYS takes priority for WhatsApp & primary call!
  if (mobilePhone) {
    phone = mobilePhone;
    whatsApp = mobilePhone;
  } else if (officePhone) {
    phone = officePhone;
    whatsApp = officePhone;
  }

  // -------------------------------------------------------------
  // 4. FOURTH PASS: Job Title, Company Name, and Person Name
  // -------------------------------------------------------------
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

    // Check for Company Name (NEVER accept website URLs as company name!)
    if (!company && COMPANY_INDICATORS.test(line)) {
      if (!isUrlOrDomain(line)) {
        company = cleanCompanyName(line);
      }
    }

    // Collect address lines (contains pin/zip, road, city, or known states)
    if (
      line.match(/\b\d{6}\b/) ||
      line.match(/(?:road|street|nagar|floor|block|city|india|telangana|delhi|mumbai|bangalore|hyderabad|pune|chennai)/i)
    ) {
      if (!line.includes("@") && !COMPANY_INDICATORS.test(line) && !isUrlOrDomain(line)) {
        addressParts.push(line);
      }
    }

    // Collect candidate name lines
    if (isValidPersonName(line)) {
      candidateNames.push(cleanPersonName(line));
    }
  }

  // -------------------------------------------------------------
  // 5. FALLBACKS FOR NAME & COMPANY
  // -------------------------------------------------------------
  // Fallback for Name if not deduced by Job Title
  if (!name && candidateNames.length > 0) {
    const found = candidateNames.find(
      (c) => c.toLowerCase() !== company.toLowerCase() && !addressParts.some((a) => a.includes(c))
    );
    if (found) {
      name = cleanPersonName(found);
    }
  }

  // Fallback for Company from Corporate Header Lines (excluding URLs and person names)
  if (!company) {
    for (const line of rawLines) {
      if (!isUrlOrDomain(line) && !isValidPersonName(line) && !line.includes("@") && !line.match(/^\+?\d/) && line.length > 4) {
        if (!addressParts.includes(line) && line !== title) {
          company = cleanCompanyName(line);
          break;
        }
      }
    }
  }

  // Fallback for Company from Website Domain
  if (!company && knownDomain) {
    const brand = knownDomain.split(".")[0];
    if (brand && brand.length > 2) {
      company = brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }

  // Assemble notes from remaining useful details
  const notesLines: string[] = [];
  if (title) notesLines.push(`Designation: ${title}`);
  if (officePhone && mobilePhone && officePhone !== mobilePhone) {
    notesLines.push(`Office Tel: ${officePhone}`);
  }
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

function isUrlOrDomain(str: string): boolean {
  return /^(?:https?:\/\/|www\.)/i.test(str) || /\.(com|in|org|net|co|io|biz|info)\b/i.test(str);
}

function cleanPersonName(str: string): string {
  return str
    .replace(/^[^a-zA-Z]+|[^a-zA-Z.]+$/g, "")
    // Strip trailing single letter field abbreviations like "Shubham Sharma T" -> "Shubham Sharma"
    .replace(/\s+[TMEOFWPD]$/i, "")
    .replace(/^(?:Name|Mr|Ms|Mrs|Dr)[\s.:/-]+/i, "")
    .trim();
}

function cleanCompanyName(str: string): string {
  return str
    .replace(/^(?:ac|ad|the|at|in|on)\s+/i, "")
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.)]+$/g, "")
    .trim();
}

function cleanEmail(str: string): string {
  let cleaned = str.replace(/\s+/g, "").toLowerCase();
  if (cleaned.endsWith(".corn")) cleaned = cleaned.replace(/\.corn$/, ".com");
  if (cleaned.endsWith(".c0m")) cleaned = cleaned.replace(/\.c0m$/, ".com");
  return cleaned;
}

function cleanPhoneNumber(str: string): string {
  let s = str.trim();
  // Fix OCR misreading leading '+' as '4' (e.g. "491404904 8400" -> "+91 40 4904 8400")
  if (/^491\d{9,10}/.test(s.replace(/\s+/g, ""))) {
    s = "+" + s.replace(/^4/, "");
  }

  const digits = s.replace(/[^\d+]/g, "");
  // Retain already formatted international
  if (digits.startsWith("+")) {
    if (digits.startsWith("+91") && digits.length === 13) {
      return `+91 ${digits.slice(3, 8)} ${digits.slice(8)}`;
    }
    return s;
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
  return s;
}

function isValidPersonName(str: string): boolean {
  const cleaned = cleanPersonName(str);
  if (cleaned.length < 3 || cleaned.length > 40) return false;
  if (cleaned.includes("@") || isUrlOrDomain(cleaned)) return false;
  if (/\d/.test(cleaned)) return false;
  if (NON_NAME_WORDS.test(cleaned)) return false;
  if (COMPANY_INDICATORS.test(cleaned)) return false;

  // Personal names usually 1 to 4 words (e.g. "Shubham Sharma", "Dr. Amit Verma")
  const words = cleaned.split(/\s+/);
  return words.length >= 1 && words.length <= 4;
}
