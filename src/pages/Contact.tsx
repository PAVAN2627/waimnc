import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-bold text-primary">{t("संपर्क", "Contact")}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">{t("कार्यालयाची माहिती", "Office Information")}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("पत्ता", "Address")}</p>
                      <p className="text-sm text-muted-foreground">{t("587b, मोतीबाग रोड, दाणेबाजार, गणपती आळी, वाई, महाराष्ट्र - 412803", "587b, Motibag Rd, Danebazar, Ganpati Ali, Wai, Maharashtra 412803")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("दूरध्वनी", "Telephone")}</p>
                      <p className="text-sm text-muted-foreground">02167-220000, 02167-220001</p>
                      <p className="text-sm text-muted-foreground">{t("हेल्पलाइन: 1800-123-4567 (टोल फ्री)", "Helpline: 1800-123-4567 (Toll Free)")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("ईमेल", "Email")}</p>
                      <p className="text-sm text-muted-foreground">info@wainagarpalika.gov.in</p>
                      <p className="text-sm text-muted-foreground">complaints@wainagarpalika.gov.in</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("कार्यालयीन वेळ", "Office Hours")}</p>
                      <p className="text-sm text-muted-foreground">{t("सोमवार - शनिवार: सकाळी 9:45 - संध्याकाळी 6:15", "Monday - Saturday: 9:45 AM - 6:15 PM")}</p>
                      <p className="text-sm text-muted-foreground">{t("रविवार व सार्वजनिक सुट्ट्या: बंद", "Sunday & Public Holidays: Closed")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("वेबसाइट", "Website")}</p>
                      <p className="text-sm text-muted-foreground">www.wainagarpalika.gov.in</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3793.!2d73.8997!3d17.9558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23f5555555555%3A0x0!2sWai+Municipal+Council%2C+Motibag+Rd%2C+Wai%2C+Maharashtra+412803!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">{t("आम्हाला संदेश पाठवा", "Send us a Message")}</h2>
              <Input placeholder={t("आपले नाव", "Your Name")} />
              <Input placeholder={t("ईमेल", "Email")} type="email" />
              <Input placeholder={t("मोबाइल नंबर", "Mobile Number")} type="tel" />
              <Input placeholder={t("विषय", "Subject")} />
              <Textarea placeholder={t("आपला संदेश लिहा...", "Write your message...")} rows={5} />
              <Button className="gov-gradient text-primary-foreground w-full">{t("संदेश पाठवा", "Send Message")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
