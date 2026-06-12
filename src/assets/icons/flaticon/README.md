# Flaticon Animated Icons — assets

`AnimatedIcon` (`src/components/shared/AnimatedIcon.tsx`) ใช้ไฟล์ในโฟลเดอร์นี้
ไฟล์ถูก **`import` เข้า bundle** ผ่าน registry `src/components/shared/animatedIconAssets.ts`
(ไม่ได้ serve จาก `public/` แล้ว → ได้ URL ที่ content-hash + อยู่ใน build แน่นอน)
**การเพิ่มไฟล์ `.webp` เฉย ๆ ไม่พอ — ต้องลงทะเบียนใน registry ด้วย** (ดูขั้นตอนล่าง)

## รูปแบบไฟล์

- **`<name>.webp`** = ไฟล์ที่ใช้จริง: animated, **พื้นหลังโปร่งใส** (key ขาวออกแล้ว), RGB flatten เป็น silhouette
- **`<name>-still.webp`** = เฟรมแรกแบบนิ่ง สำหรับ rest state ของ trigger `hover`
- ต้นฉบับ `.gif` (พื้นหลังขาว) ถูกลบออกแล้วเพื่อลดขนาด deploy (เคยรวม ~14MB) —
  ถ้าจะ **เพิ่ม/แก้** ไอคอน ให้โหลด `.gif` ใหม่จาก Flaticon มาวางชั่วคราว แล้ว generate `.webp` ตามด้านล่าง

`AnimatedIcon` ระบายสีไอคอนด้วย **CSS `mask` + `background-color` จาก theme token** (เช่น `bg-info`, `bg-foreground`)
→ สีมาจาก token จริง **ไม่มี hex hardcode** และปรับตาม **dark mode** เองตาม token (ไม่ต้องใช้ filter/invert)
ดังนั้น **ไม่มีข้อยกเว้น rule 08** อีกต่อไป

## วิธี generate `.webp` จาก `.gif` (ใช้ ffmpeg)

ถ้าจะ **เพิ่ม/เปลี่ยน** ไอคอน: วาง `<name>.gif` (พื้นหลังขาว) แล้วรัน 2 คำสั่งนี้ในโฟลเดอร์นี้

```bash
KEY="format=rgba,colorkey=0xFFFFFF:0.18:0.08,lutrgb=r=0:g=0:b=0,scale=72:-1:flags=lanczos"
# animated (ทุกตัว)
ffmpeg -y -i <name>.gif -vf "fps=10,$KEY" -c:v libwebp_anim -loop 0 -lossless 0 -quality 50 -compression_level 6 <name>.webp
# still (เฉพาะ trigger=hover)
ffmpeg -y -i <name>.gif -vf "$KEY" -frames:v 1 -lossless 1 <name>-still.webp
```

- `colorkey=0xFFFFFF` = key พื้นหลังขาวออก (ปรับ `0.18` ขึ้นถ้ายังเหลือขอบขาว, ลงถ้ากินตัวไอคอน)
- `lutrgb=...=0` = flatten RGB เป็นดำ (mask ใช้แค่ alpha → ไฟล์เล็กลงมาก)
- ต้องเป็นไอคอน **พื้นหลังขาวล้วน** ถ้าเป็นสีอื่นให้แก้ค่า `colorkey`

### ลงทะเบียนไอคอนใหม่ใน registry (บังคับ)

หลัง generate `.webp` แล้ว เพิ่ม `import` + entry ใน `src/components/shared/animatedIconAssets.ts`:

```ts
import foo from '@/assets/icons/flaticon/foo.webp'
import fooStill from '@/assets/icons/flaticon/foo-still.webp' // เฉพาะถ้าใช้ trigger='hover'

export const ANIMATED_ICONS = {
  // ...
  foo: { animated: foo.src, still: fooStill.src },
} satisfies Record<string, IconAsset>
```

`name` ของ `AnimatedIcon` เป็น union type ที่ derive จาก key ของ registry → ลืมลงทะเบียน = TS error ตอน build (ไม่หลุดไป 404 ตอน runtime อีกแล้ว)

## Mapping (slot → asset → สีจาก theme token)

| slot | basename | trigger | color token | ความหมาย |
|---|---|---|---|---|
| `Home/Header.tsx`, `Layout/DashboardHeader.tsx` | `menu` | hover | `bg-foreground` (default) | เมนู |
| `Home/Footer.tsx` | `mail` | hover | `bg-primary-foreground` | อีเมล |
| `Home/Footer.tsx` | `chat` | hover | `bg-primary-foreground` | LINE/แชท |
| `Home/Footer.tsx` | `globe` | hover | `bg-primary-foreground` | Facebook/เว็บ |
| `Home/Footer.tsx` | `phone` | hover | `bg-primary-foreground` | โทรศัพท์ |
| `Layout/UserMenu.tsx` | `user` | hover | `bg-foreground` (default) | ผู้ใช้ |
| `Layout/MobileMenuContent.tsx` | `log-out` | hover | `bg-destructive` | ออกจากระบบ |
| `Home/HeroSection.tsx` | `rocket` | loop | `bg-info` | focal hero |
| `Home/CTASection.tsx` | `rocket` | hover | `bg-secondary-foreground` | CTA |
| `Home/ServicesSection.tsx` | `trending-up` | hover | `bg-info` | accent การ์ด |
| `customer-report/.../ChartEmptyState.tsx` | `trending-up` | loop | `bg-muted-foreground` | empty state |
| `Home/PackagesSection.tsx` (แผนแนะนำ) | `check` | loop | `bg-secondary` | เครื่องหมายถูก |

## License / Attribution

Flaticon free tier บังคับใส่ attribution — มีลิงก์ "Animated icons by Flaticon" ใน `Footer.tsx` แล้ว
จด author ของแต่ละไอคอนไว้ที่นี่ถ้าต้องการ attribution ละเอียด:

- menu: …
- mail / chat / globe / phone: …
- user / log-out: …
- rocket / trending-up / check: …
