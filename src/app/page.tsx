"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Role } from "@/types/auth";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-text-dark">
                SEO Report Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    สวัสดี, {session.user.name}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-purple text-white">
                    {session.user.role}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="bg-primary-purple hover:bg-accent-purple-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-dark mb-4">
            ยินดีต้อนรับสู่ SEO Report Dashboard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ระบบจัดการรายงาน SEO สำหรับติดตามผลการทำงานของ Keywords และ Domain
            Metrics
          </p>
        </div>

        {session ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Admin Dashboard */}
            {session.user.role === Role.ADMIN && (
              <Link href="/admin/dashboard" className="group">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:border-primary-purple border border-transparent">
                  <div className="text-primary-purple mb-4">
                    <svg
                      className="w-8 h-8"
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
                  </div>
                  <h3 className="text-lg font-semibold text-text-dark mb-2">
                    Admin Dashboard
                  </h3>
                  <p className="text-gray-600 text-sm">
                    จัดการระบบและผู้ใช้งานทั้งหมด
                  </p>
                </div>
              </Link>
            )}

            {/* SEO Dashboard */}
            {(session.user.role === Role.ADMIN ||
              session.user.role === Role.SEO_DEV) && (
              <Link href="/seo/dashboard" className="group">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:border-primary-purple border border-transparent">
                  <div className="text-primary-purple mb-4">
                    <svg
                      className="w-8 h-8"
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
                  </div>
                  <h3 className="text-lg font-semibold text-text-dark mb-2">
                    SEO Dashboard
                  </h3>
                  <p className="text-gray-600 text-sm">
                    จัดการรายงาน SEO และลูกค้า
                  </p>
                </div>
              </Link>
            )}

            {/* Customer Dashboard */}
            {session.user.role === Role.CUSTOMER && (
              <Link href="/customer/dashboard" className="group">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:border-primary-purple border border-transparent">
                  <div className="text-primary-purple mb-4">
                    <svg
                      className="w-8 h-8"
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
                  </div>
                  <h3 className="text-lg font-semibold text-text-dark mb-2">
                    Customer Dashboard
                  </h3>
                  <p className="text-gray-600 text-sm">ดูรายงาน SEO ของคุณ</p>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                เข้าสู่ระบบเพื่อใช้งาน
              </h3>
              <p className="text-gray-600 mb-6">
                กรุณาเข้าสู่ระบบเพื่อเข้าถึงรายงาน SEO ของคุณ
              </p>
              <Link
                href="/login"
                className="bg-primary-purple hover:bg-accent-purple-dark text-white px-6 py-3 rounded-lg font-medium inline-block"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
