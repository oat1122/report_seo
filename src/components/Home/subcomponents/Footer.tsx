import { Mail, Phone, Globe, MessageCircle } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { contactInfo } from '@/components/Home/constants/data'

const FooterColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-primary-foreground mb-3 text-xl font-semibold">{children}</h3>
)

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <FooterColumnTitle>SEO PRIME</FooterColumnTitle>
            <p className="text-sm opacity-80">
              ให้บริการด้านการตลาดออนไลน์ เกี่ยวกับจัดทำ SEO ครบวงจรดูแลโดยทีมการตลาดที่มีประสบการณ์
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
              <li className="group flex items-center gap-2">
                <AnimatedIcon
                  name="mail"
                  trigger="hover"
                  size={16}
                  color="bg-primary-foreground"
                  fallback={<Mail className="size-4" />}
                />
                <span>E-MAIL:</span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="group flex items-center gap-2">
                <AnimatedIcon
                  name="chat"
                  trigger="hover"
                  size={16}
                  color="bg-primary-foreground"
                  fallback={<MessageCircle className="size-4" />}
                />
                <span>LINE:</span>
                <a href={contactInfo.line} className="underline-offset-4 hover:underline">
                  คลิกที่นี่
                </a>
              </li>
              <li className="group flex items-center gap-2">
                <AnimatedIcon
                  name="globe"
                  trigger="hover"
                  size={16}
                  color="bg-primary-foreground"
                  fallback={<Globe className="size-4" />}
                />
                <span>FACEBOOK:</span>
                <a href="#" className="underline-offset-4 hover:underline">
                  {contactInfo.facebook}
                </a>
              </li>
              <li className="group flex items-center gap-2">
                <AnimatedIcon
                  name="phone"
                  trigger="hover"
                  size={16}
                  color="bg-primary-foreground"
                  fallback={<Phone className="size-4" />}
                />
                <span>TEL 1: {contactInfo.phone1}</span>
              </li>
              <li className="group flex items-center gap-2">
                <AnimatedIcon
                  name="phone"
                  trigger="hover"
                  size={16}
                  color="bg-primary-foreground"
                  fallback={<Phone className="size-4" />}
                />
                <span>TEL 2: {contactInfo.phone2}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-primary-foreground/10 flex flex-col items-center gap-1 border-t py-3 text-center text-sm opacity-70">
        <span>Copyright 2025 © SEO Prime</span>
        <a
          href="https://www.flaticon.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-foreground/70 text-xs underline-offset-4 hover:underline"
        >
          Animated icons by Flaticon
        </a>
      </div>
    </footer>
  )
}
