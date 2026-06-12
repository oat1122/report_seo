import chat from '@/assets/icons/flaticon/chat.webp'
import chatStill from '@/assets/icons/flaticon/chat-still.webp'
import check from '@/assets/icons/flaticon/check.webp'
import globe from '@/assets/icons/flaticon/globe.webp'
import globeStill from '@/assets/icons/flaticon/globe-still.webp'
import logOut from '@/assets/icons/flaticon/log-out.webp'
import logOutStill from '@/assets/icons/flaticon/log-out-still.webp'
import mail from '@/assets/icons/flaticon/mail.webp'
import mailStill from '@/assets/icons/flaticon/mail-still.webp'
import menu from '@/assets/icons/flaticon/menu.webp'
import menuStill from '@/assets/icons/flaticon/menu-still.webp'
import phone from '@/assets/icons/flaticon/phone.webp'
import phoneStill from '@/assets/icons/flaticon/phone-still.webp'
import rocket from '@/assets/icons/flaticon/rocket.webp'
import rocketStill from '@/assets/icons/flaticon/rocket-still.webp'
import trendingUp from '@/assets/icons/flaticon/trending-up.webp'
import trendingUpStill from '@/assets/icons/flaticon/trending-up-still.webp'
import user from '@/assets/icons/flaticon/user.webp'
import userStill from '@/assets/icons/flaticon/user-still.webp'

// asset ถูก import เข้า bundle → ได้ URL ที่ content-hash แล้ว (/_next/static/media/...)
// แทน path ดิบใน public/ ทำให้ asset อยู่ใน build แน่นอน + cache-bust อัตโนมัติ
// `animated` = ไฟล์ที่เล่น (ทุกตัว), `still` = เฟรมนิ่งสำหรับ rest state ของ trigger 'hover'
// (ตัวที่ใช้ loop ล้วน เช่น check ไม่มี still)
interface IconAsset {
  animated: string
  still?: string
}

const ICON_SOURCES = {
  chat: { animated: chat.src, still: chatStill.src },
  check: { animated: check.src },
  globe: { animated: globe.src, still: globeStill.src },
  'log-out': { animated: logOut.src, still: logOutStill.src },
  mail: { animated: mail.src, still: mailStill.src },
  menu: { animated: menu.src, still: menuStill.src },
  phone: { animated: phone.src, still: phoneStill.src },
  rocket: { animated: rocket.src, still: rocketStill.src },
  'trending-up': { animated: trendingUp.src, still: trendingUpStill.src },
  user: { animated: user.src, still: userStill.src },
} satisfies Record<string, IconAsset>

export type AnimatedIconName = keyof typeof ICON_SOURCES

// widen value เป็น IconAsset (still เป็น optional) แต่คง key literal ไว้สำหรับ union type
export const ANIMATED_ICONS: Record<AnimatedIconName, IconAsset> = ICON_SOURCES
