import { useState } from "react";
import { Languages, LoaderCircle } from "lucide-react";
import { translateToMarathi } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

interface TranslateField {
  value?: string;
  onTranslated?: (marathi: string) => void;
}

interface Props {
  fields?: TranslateField[];
  sourceText?: string;
  onTranslated?: (text: string) => void;
  className?: string;
}

const AutoTranslateButton = ({ fields, sourceText, onTranslated, className = "" }: Props) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const normalizedFields: { value: string; onTranslated: (t: string) => void }[] = [];

  if (Array.isArray(fields)) {
    fields.forEach((f) => {
      if (f && typeof f.value === "string" && typeof f.onTranslated === "function") {
        normalizedFields.push({ value: f.value, onTranslated: f.onTranslated });
      }
    });
  } else if (typeof sourceText === "string" && typeof onTranslated === "function") {
    normalizedFields.push({ value: sourceText, onTranslated });
  }

  const hasContent = normalizedFields.some((f) => f.value && f.value.trim().length > 0);

  const handleAll = async () => {
    if (!hasContent) return;
    try {
      setLoading(true);
      await Promise.all(
        normalizedFields
          .filter((f) => f.value && f.value.trim())
          .map(async (f) => {
            const result = await translateToMarathi(f.value);
            f.onTranslated(result);
          })
      );
      toast({ title: "भाषांतर यशस्वी ✓", description: "अनुवाद पूर्ण झाला." });
    } catch {
      toast({ title: "भाषांतर अयशस्वी", description: "Translation failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAll}
      disabled={loading || !hasContent}
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium ${className}`}
    >
      {loading
        ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        : <Languages className="h-3.5 w-3.5" />}
      {loading ? "भाषांतर होत आहे..." : "🔄 मराठी अनुवाद करा"}
    </button>
  );
};

export default AutoTranslateButton;
