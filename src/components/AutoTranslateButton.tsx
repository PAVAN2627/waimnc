import { useState } from "react";
import { Languages, LoaderCircle } from "lucide-react";
import { translateToMarathi } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

interface TranslateField {
  value: string;
  onTranslated: (marathi: string) => void;
}

interface Props {
  fields: TranslateField[];
  className?: string;
}

/**
 * Single "Translate All" button — translates all English fields to Marathi at once.
 */
const AutoTranslateButton = ({ fields, className = "" }: Props) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const hasContent = fields.some((f) => f.value.trim());

  const handleAll = async () => {
    if (!hasContent) return;
    try {
      setLoading(true);
      await Promise.all(
        fields
          .filter((f) => f.value.trim())
          .map(async (f) => {
            const result = await translateToMarathi(f.value);
            f.onTranslated(result);
          })
      );
      toast({ title: "भाषांतर यशस्वी ✓", description: "All fields translated to Marathi." });
    } catch {
      toast({ title: "भाषांतर अयशस्वी", description: "Translation failed. Check internet.", variant: "destructive" });
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
      {loading ? "भाषांतर होत आहे..." : "🔄 सर्व मराठीत अनुवाद करा"}
    </button>
  );
};

export default AutoTranslateButton;
