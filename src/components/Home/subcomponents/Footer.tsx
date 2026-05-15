import { Mail, Phone, Globe, MessageCircle } from "lucide-react";
import { contactInfo } from "@/components/Home/constants/data";

const FooterColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 text-xl font-semibold text-primary-foreground">
    {children}
  </h3>
);

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <FooterColumnTitle>SEO PRIME</FooterColumnTitle>
            <p className="text-sm opacity-80">
              ให้บริการด้านการตลาดออนไลน์ เกี่ยวกับจัดทำ SEO
              ครบวงจรดูแลโดยทีมการตลาดที่มีประสบการณ์
              เราพร้อมแล้วที่จะสร้างทีมที่แข็งแรงเพื่อเป็นหนึ่งในความสำเร็จสำคัญให้กับทุกธุรกิจของคุณ
            </p>
          </div>

          <div>
            <FooterColumnTitle>ADDRESS</FooterColumnTitle>
            <p className="text-sm opacity-80">{contactInfo.address}</p>
          </div>

          <div>
            <FooterColumnTitle>CONTACT US</FooterColumnTitle>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>E-MAIL:</span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4" />
                <span>LINE:</span>
                <a
                  href={contactInfo.line}
                  className="underline-offset-4 hover:underline"
                >
                  คลิกที่นี่
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-4" />
                <span>FACEBOOK:</span>
                <a href="#" className="underline-offset-4 hover:underline">
                  {contactInfo.facebook}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>TEL 1: {contactInfo.phone1}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>TEL 2: {contactInfo.phone2}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-3 text-center text-sm opacity-70">
        Copyright 2025 © SEO Prime
      </div>
    </footer>
  );
};
