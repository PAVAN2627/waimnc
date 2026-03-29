/**
 * Translates text using Google Translate's free (unofficial) endpoint.
 * No API key required — same endpoint used by the browser extension.
 * Rate limit: fine for low-volume admin use.
 */
export async function translateToMarathi(text: string): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Translation failed");
  const data = await res.json();
  // Response format: [[[translatedText, originalText, ...]]]
  return data[0]
    .map((chunk: [string]) => chunk[0])
    .join("");
}
