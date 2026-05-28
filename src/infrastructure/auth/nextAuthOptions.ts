import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { prismaBase } from '@/infrastructure/prisma/client'
import { logger } from '@/lib/logger'
import { Role } from '@/types/auth'

// dummy bcrypt hash ใช้ตอน user ไม่พบ — เพื่อให้เวลา hash compare เท่ากันทุกกรณี
// กัน timing oracle ที่ enumerate email valid ผ่านความต่างของ response time
// hash ของ random secret ที่ generate ตอน module load — กัน attacker pre-compute
// hashSync ที่ cost 10 บล็อก event loop ~50ms ครั้งเดียวตอน boot ยอมรับได้
const DUMMY_BCRYPT_HASH = bcrypt.hashSync(randomBytes(32).toString('hex'), 10)

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false

export const authOptions: NextAuthOptions = {
  cookies: {
    sessionToken: {
      name: useSecureCookies ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: useSecureCookies ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: useSecureCookies ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      // ใช้ prismaBase ตรง ๆ เพื่อ bypass soft-delete middleware
      // ระหว่าง authorize เราต้อง check deletedAt เองด้วย where clause
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prismaBase.user.findUnique({
            where: {
              email: credentials.email,
              deletedAt: null,
            },
          })

          // เรียก bcrypt.compare เสมอแม้ user ไม่พบ เพื่อให้เวลาเท่ากัน
          const hash = user?.password ?? DUMMY_BCRYPT_HASH
          const isPasswordValid = await bcrypt.compare(credentials.password, hash)

          if (!user || !user.password || !isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
          }
        } catch (error) {
          logger.error({ err: error }, 'auth authorize error')
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // 8 ชม. — สั้นพอที่ token รั่วจะหมดอายุก่อน attacker reuse นาน
    // NextAuth v4 ไม่ rolling refresh อัตโนมัติ — ผู้ใช้จะต้อง re-login ทุก 8 ชม.
    // ถ้าต้องการ activity-based refresh ต้องเพิ่ม session.updateAge + ฝั่ง client
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
}
