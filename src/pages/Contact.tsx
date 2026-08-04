import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Globe, Send, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const Contact = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Hero Card Banner */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("नागरी संपर्क व मदत कक्ष", "Citizen Contact Desk")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">{t("संपर्क व मुख्य कार्यालय", "Contact Us")}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "वाई नगरपरिषदेच्या मुख्य प्रशासकीय कार्यालयाशी संपर्क साधा, तक्रार किंवा अभिप्रायासाठी संदेश पाठवा.",
                      "Connect with Wai Municipal Council administration office or send a direct inquiry."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  📞
                </div>
              </div>
            </div>

            {/* Quick Contact Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{t("मुख्य कार्यालय पत्ता", "Office Address")}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t("५८७b, मोतीबाग रोड, दाणेबाजार, गणपती आळी, वाई ४१२८०३", "587b, Motibag Rd, Danebazar, Ganpati Ali, Wai 412803")}
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{t("दूरध्वनी व हेल्पलाईन", "Telephone & Helpline")}</h3>
                  <p className="text-xs font-mono font-bold text-foreground mt-1">02167-220000 / 220001</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">Toll Free: 1800-123-4567</p>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{t("अधिकृत ई-मेल", "Official Email")}</h3>
                  <p className="text-xs font-bold text-foreground mt-1 truncate">info@wainagarpalika.gov.in</p>
                  <p className="text-[11px] text-muted-foreground truncate">complaints@wainagarpalika.gov.in</p>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{t("कार्यालयीन वेळ", "Office Hours")}</h3>
                  <p className="text-xs text-foreground font-semibold mt-1">{t("सोम - शनि: सकाळी 9:45 - 6:15", "Mon - Sat: 9:45 AM - 6:15 PM")}</p>
                  <p className="text-[11px] text-muted-foreground">{t("रविवार व सुट्ट्या: बंद", "Sun & Holidays: Closed")}</p>
                </div>
              </div>
            </div>

            {/* Split Section: Contact Form & Google Map */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              
              {/* Message Inquiry Form */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-xl font-black text-foreground">{t("आम्हाला थेट संदेश पाठवा", "Send Us a Message")}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("तुमची चौकशी किंवा अभिप्राय नोंदवा, प्रशासन त्वरित संपर्क करेल.", "Fill in your details below for any inquiry or official request.")}</p>
                </div>

                {submitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">{t("संदेश पाठवला गेला!", "Message Sent Successfully!")}</h3>
                    <p className="text-xs text-muted-foreground">{t("तुमचा संदेश नगरपरिषदेकडे नोंदवला गेला आहे. लवकरच संपर्क केला जाईल.", "Thank you for reaching out to Wai Municipal Council.")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{t("आपले नाव *", "Your Name *")}</label>
                      <Input required placeholder={t("पूर्ण नाव...", "Enter full name...")} className="rounded-xl" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("ई-मेल *", "Email *")}</label>
                        <Input required type="email" placeholder="example@mail.com" className="rounded-xl" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                        <Input required type="tel" placeholder="98XXXXXXXX" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{t("विषय *", "Subject *")}</label>
                      <Input required placeholder={t("संदेशाचा विषय...", "Enter subject...")} className="rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{t("संदेश सविस्तर लिहा *", "Message Details *")}</label>
                      <Textarea required placeholder={t("आपला संदेश किंवा चौकशी सविस्तर प्रविष्ट करा...", "Type your message details...")} rows={4} className="rounded-xl" />
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl gov-gradient text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <span>{t("संदेश सबमिट करा", "Send Message")}</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              {/* Google Map Container */}
              <div className="space-y-4">
                <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{t("गूगल मॅप नकाशा व स्थान", "Google Map Location")}</span>
                    </span>
                    <a
                      href="https://maps.google.com/?q=Wai+Municipal+Council"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {t("मॅप उघडा ↗", "Open Map ↗")}
                    </a>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3793.0!2d73.8997!3d17.9558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23f5555555555%3A0x0!2sWai+Municipal+Council%2C+Motibag+Rd%2C+Wai%2C+Maharashtra+412803!5e0!3m2!1sen!2sin!4v1"
                    width="100%"
                    height="380"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
