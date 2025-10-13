"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import Link from "next/link";
import { Role } from "@/types/auth";

// ไอคอนสำหรับใช้ในหน้าเว็บ
const Icons = {
  logo: (
    <svg
      className="w-5 h-5 text-primary-foreground"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  arrowRight: (
    <svg
      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  checkCircle: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  admin: (
    <svg
      className="w-6 h-6 text-primary-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  seo: (
    <svg
      className="w-6 h-6 text-primary-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  customer: (
    <svg
      className="w-6 h-6 text-success-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  keyword: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 mb-4 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  domain: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 mb-4 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9"
      />
    </svg>
  ),
  report: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 mb-4 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
};

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-muted-foreground animate-pulse">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 shadow-card border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-accent rounded-lg flex items-center justify-center">
                {Icons.logo}
              </div>
              <h1 className="text-xl font-bold text-foreground">
                SEO Report Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      สวัสดี, {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ยินดีต้อนรับกลับมา
                    </p>
                  </div>
                  <span className="badge badge-primary">
                    {session.user.role}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="btn-outline text-sm transition-all duration-200 hover:scale-105"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="btn-primary transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content: Toggles between logged-in and logged-out views */}
      <main>
        {session ? <LoggedInView session={session} /> : <LoggedOutView />}
      </main>
    </div>
  );
}

// ===================================
// Logged-In Component
// ===================================
const LoggedInView = ({ session }: { session: Session }) => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-3">
        เลือก Dashboard ของคุณ
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        เข้าถึงเครื่องมือและรายงานที่เหมาะสมกับบทบาทของคุณเพื่อเริ่มการทำงาน
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Admin Dashboard Card */}
      {session.user.role === Role.ADMIN && (
        <Link href="/admin/dashboard" className="group">
          <div className="card p-6 text-center transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-105 group-hover:border-primary/50 border border-transparent">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              {Icons.admin}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Admin Dashboard
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              จัดการระบบ, ผู้ใช้งาน, และตั้งค่าทั้งหมดของระบบ
            </p>
            <span className="flex items-center justify-center text-primary text-sm font-medium group-hover:text-primary-accent">
              เข้าสู่หน้าจัดการ {Icons.arrowRight}
            </span>
          </div>
        </Link>
      )}

      {/* SEO Dashboard Card */}
      {(session.user.role === Role.ADMIN ||
        session.user.role === Role.SEO_DEV) && (
        <Link href="/seo/dashboard" className="group">
          <div className="card p-6 text-center transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-105 group-hover:border-secondary/50 border border-transparent">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              {Icons.seo}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              SEO Dashboard
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              จัดการรายงาน SEO, วิเคราะห์ keywords และติดตามลูกค้า
            </p>
            <span className="flex items-center justify-center text-secondary text-sm font-medium group-hover:text-secondary/80">
              เข้าสู่ SEO Tools {Icons.arrowRight}
            </span>
          </div>
        </Link>
      )}

      {/* Customer Dashboard Card */}
      {session.user.role === Role.CUSTOMER && (
        <Link href="/customer/dashboard" className="group">
          <div className="card p-6 text-center transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-105 group-hover:border-success/50 border border-transparent">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-primary-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              {Icons.customer}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Customer Dashboard
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              ดูรายงาน SEO ส่วนตัว และติดตามผลงานของคุณ
            </p>
            <span className="flex items-center justify-center text-success text-sm font-medium group-hover:text-success/80">
              ดูรายงานของฉัน {Icons.arrowRight}
            </span>
          </div>
        </Link>
      )}
    </div>
  </section>
);

// ===================================
// Logged-Out Component
// ===================================
const LoggedOutView = () => (
  <>
    {/* Hero Section */}
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 sm:py-28">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            {Icons.checkCircle}
            <span>ระบบรายงาน SEO ที่ทันสมัยและครบวงจร</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-in-from-top">
            วิเคราะห์และติดตามผล SEO <br />
            <span className="bg-gradient-to-r from-primary via-primary-accent to-secondary bg-clip-text text-transparent">
              อย่างมืออาชีพ
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-in-from-bottom">
            เปลี่ยนข้อมูลที่ซับซ้อนให้เป็นรายงานที่เข้าใจง่าย ติดตามอันดับ
            Keywords, สุขภาพของโดเมน และสร้างกลยุทธ์ SEO ที่ดีกว่าเดิม
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              เริ่มต้นใช้งานฟรี
            </Link>
            <button className="btn-outline text-lg px-8 py-3 transition-all duration-300 hover:scale-105">
              เรียนรู้เพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            เครื่องมือที่ตอบโจทย์ทุกการทำ SEO
          </h2>
          <p className="text-lg text-muted-foreground">
            เรามีทุกสิ่งที่คุณต้องการในการวิเคราะห์, ติดตาม, และวางแผนกลยุทธ์
            SEO เพื่อให้ธุรกิจของคุณเติบโตบนโลกออนไลน์
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card p-8 text-center">
            {Icons.keyword}
            <h3 className="text-xl font-bold text-foreground mb-3">
              วิเคราะห์ Keywords
            </h3>
            <p className="text-muted-foreground">
              ค้นหา, ติดตาม และวิเคราะห์อันดับของ Keywords สำคัญ
              เพื่อเข้าใจถึงประสิทธิภาพและโอกาสในการแข่งขัน
            </p>
          </div>
          {/* Feature 2 */}
          <div className="card p-8 text-center">
            {Icons.domain}
            <h3 className="text-xl font-bold text-foreground mb-3">
              ตรวจสอบ Domain Metrics
            </h3>
            <p className="text-muted-foreground">
              วัดผลและติดตามสุขภาพของเว็บไซต์ผ่าน Domain Authority, Backlinks
              และตัวชี้วัดที่สำคัญอื่นๆ
            </p>
          </div>
          {/* Feature 3 */}
          <div className="card p-8 text-center">
            {Icons.report}
            <h3 className="text-xl font-bold text-foreground mb-3">
              รายงานผลอัตโนมัติ
            </h3>
            <p className="text-muted-foreground">
              สร้างรายงานสรุปผลการทำงานที่สวยงามและเข้าใจง่าย
              พร้อมส่งตรงถึงคุณและลูกค้าของคุณ
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* How it works Section */}
    <section className="py-20 sm:py-28 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            เริ่มต้นใช้งานง่ายๆ ใน 3 ขั้นตอน
          </h2>
          <p className="text-lg text-muted-foreground">
            เปลี่ยนความยุ่งยากให้เป็นเรื่องง่าย ด้วยระบบที่ออกแบบมาเพื่อคุณ
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="relative px-4">
            <div className="absolute top-5 left-1/2 -ml-px w-0.5 h-full bg-border md:hidden"></div>
            <div className="absolute left-1/2 top-5 h-0.5 w-full bg-border hidden md:block"></div>
            <div className="relative">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-lg">
                1
              </div>
              <h3 className="mt-6 text-xl font-bold text-foreground">
                เชื่อมต่อข้อมูล
              </h3>
              <p className="mt-2 text-muted-foreground">
                เพียงแค่เพิ่มโปรเจกต์และ Keywords ที่คุณต้องการติดตามเข้าระบบ
              </p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="relative px-4">
            <div className="absolute top-5 left-1/2 -ml-px w-0.5 h-full bg-border md:hidden"></div>
            <div className="absolute left-1/2 top-5 h-0.5 w-full bg-border hidden md:block"></div>
            <div className="relative">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-lg">
                2
              </div>
              <h3 className="mt-6 text-xl font-bold text-foreground">
                ดูรายงานและวิเคราะห์
              </h3>
              <p className="mt-2 text-muted-foreground">
                ระบบจะทำการเก็บข้อมูลและสร้าง Dashboard ให้คุณเห็นภาพรวมทั้งหมด
              </p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="relative px-4">
            <div className="relative">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-lg">
                3
              </div>
              <h3 className="mt-6 text-xl font-bold text-foreground">
                วางแผนกลยุทธ์
              </h3>
              <p className="mt-2 text-muted-foreground">
                นำข้อมูลเชิงลึกที่ได้ไปปรับปรุงและพัฒนากลยุทธ์ SEO
                ของคุณให้ดียิ่งขึ้น
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card p-10 sm:p-16 rounded-lg text-center shadow-card-hover border border-border">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            พร้อมที่จะขับเคลื่อนธุรกิจของคุณ
            <br />
            ด้วย SEO แล้วหรือยัง?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มต้นใช้งาน Dashboard
            และเครื่องมือวิเคราะห์ SEO ที่ครบครันที่สุด
          </p>
          <Link
            href="/login"
            className="btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            เริ่มใช้งานเลย
          </Link>
        </div>
      </div>
    </section>
  </>
);
