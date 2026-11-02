import { isFakeMobile } from "@wmc/types";

/**
 * Validates a 10-digit Indian mobile number.
 * Rejects numbers not exactly 10 digits, numbers not starting with 6-9,
 * and fake numbers with repeated digits (e.g. 9999999999) or known dummy test numbers.
 */
export function validateMobileInput(
  rawMobile: string | undefined | null,
  lang: "mr" | "en" = "mr"
): { isValid: boolean; cleaned: string; error?: string } {
  const cleaned = String(rawMobile || "").replace(/\D/g, "");

  if (!cleaned) {
    return {
      isValid: false,
      cleaned: "",
      error:
        lang === "mr"
          ? "कृपया १० अंकी मोबाईल नंबर प्रविष्ट करा."
          : "Please enter a 10-digit mobile number.",
    };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      cleaned,
      error:
        lang === "mr"
          ? `मोबाईल नंबर बरोबर १० अंकांचा असणे अनिवार्य आहे (सध्या ${cleaned.length} अंक भरले आहेत).`
          : `Mobile number must be exactly 10 digits (currently ${cleaned.length} digits).`,
    };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error:
        lang === "mr"
          ? "वैध मोबाईल नंबर ६, ७, ८ किंवा ९ ने सुरू होणे आवश्यक आहे."
          : "Valid mobile number must start with 6, 7, 8, or 9.",
    };
  }

  if (/^(\d)\1{9}$/.test(cleaned) || new Set(cleaned).size <= 1) {
    return {
      isValid: false,
      cleaned,
      error:
        lang === "mr"
          ? "बनावट किंवा एकाच अंकाची १० वेळा पुनरावृत्ती असलेला नंबर (उदा. 9999999999) चालणार नाही."
          : "Fake numbers with identical digits like 9999999999 are strictly not allowed.",
    };
  }

  const counts: Record<string, number> = {};
  for (const ch of cleaned) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  if (Object.values(counts).some((count) => count >= 8)) {
    return {
      isValid: false,
      cleaned,
      error:
        lang === "mr"
          ? "अवैध किंवा बनावट मोबाईल नंबर. कृपया खरा चालू १० अंकी नंबर टाका."
          : "Invalid or dummy mobile number. Please enter a genuine 10-digit mobile number.",
    };
  }

  if (isFakeMobile(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error:
        lang === "mr"
          ? "बनावट चाचणी नंबर (उदा. 9876543210, 1234567890) स्वीकारला जाणार नाही."
          : "Fake test numbers (e.g. 9876543210) are not permitted.",
    };
  }

  return {
    isValid: true,
    cleaned,
  };
}

/**
 * Cleans input value on the fly, restricting to max 10 digits.
 */
export function sanitizeMobileInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

