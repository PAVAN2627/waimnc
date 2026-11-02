interface FormattedDescriptionProps {
  description: string;
  className?: string;
}

export function FormattedDescription({ description, className = "" }: FormattedDescriptionProps) {
  if (!description) return null;

  // Split lines by newline. If string has no newlines but has [Header] or multiple colons, split them as fallback
  let rawLines = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (rawLines.length === 1 && (description.match(/:/g) || []).length > 1) {
    rawLines = description
      .replace(/(\[[^\]]+\])/g, "\n$1\n")
      .replace(/\s+([^:\n]+:)/g, "\n$1")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const headerLine = rawLines.find((l) => l.startsWith("[") && l.endsWith("]"));
  const contentLines = rawLines.filter((l) => !(l.startsWith("[") && l.endsWith("]")));

  const fieldPairs: { label: string; value: string }[] = [];
  const normalTextLines: string[] = [];

  contentLines.forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 45) {
      const label = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      fieldPairs.push({ label, value });
    } else {
      normalTextLines.push(line);
    }
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Badge */}
      {headerLine && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl gov-gradient text-white text-xs font-black shadow-sm">
          <span>📋</span>
          <span>{headerLine.replace(/^\[|\]$/g, "")}</span>
        </div>
      )}

      {/* Structured Key-Value Fields Grid */}
      {fieldPairs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fieldPairs.map((pair, idx) => {
            const isFullWidth =
              pair.label.includes("पत्ता") ||
              pair.label.includes("तपशील") ||
              pair.label.includes("वर्णन") ||
              pair.label.includes("नोंद") ||
              pair.value.length > 40;
            return (
              <div
                key={idx}
                className={`p-2.5 px-3 rounded-xl border border-border/80 bg-muted/40 flex flex-col justify-center space-y-0.5 ${
                  isFullWidth ? "sm:col-span-2" : ""
                }`}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0"></span>
                  {pair.label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground break-words pl-3">
                  {pair.value || "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Freeform Lines */}
      {normalTextLines.length > 0 && (
        <div className="p-3.5 rounded-xl bg-card border border-border/80 text-xs sm:text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed space-y-1">
          {normalTextLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormattedDescription;

