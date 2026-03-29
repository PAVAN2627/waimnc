import { useState } from "react";
import { Languages, LoaderCircle } from "lucide-react";
import { translateToMarathi } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

interface Props {
  /** The English source value to translate */
  sourceValue: string;
  /** Called with the Marathi translation result */
  onTranslated: (marathi: string) => void;
  className?: string;
}

/**
 * Small button that auto-translates English → Marathi.
 * Place it next to the Marathi input field.
 */
const AutoTranslateButton = ({ sourceValue, onTranslated, className = "" }: Props) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handle = async () => {
    if (!sourceValue.trim()) {
      toast({ title: "English मजकूर टाका", description: "Please enter English text first.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const result = await translateToMarathi(sourceValue);
      onTranslated(result);
      toast({ title: "भाषांतर यशस्वी ✓", description: "Translated to Marathi." });
    } catch {
      toast({ title: "भाषांतर अयशस्वी", description: "Translation failed. Check internet connection.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading || !sourceValue.trim()}
      title="Auto-translate English → Marathi"
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {loading
        ? <LoaderCircle className="h-3 w-3 animate-spin" />
        : <Languages className="h-3 w-3" />}
      {loading ? "भाषांतर..." : "मराठीत अनुवाद करा"}
    </button>
  );
};

export default AutoTranslateButton;
