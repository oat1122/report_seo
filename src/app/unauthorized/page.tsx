import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-text-dark mb-2 text-2xl font-bold">ไม่มีสิทธิ์เข้าถึง</h1>

          <p className="mb-6 text-gray-600">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="bg-primary-purple hover:bg-accent-purple-dark inline-block w-full rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200"
            >
              กลับไปหน้าหลัก
            </Link>

            <Link
              href="/login"
              className="text-text-dark inline-block w-full rounded-lg border border-gray-300 px-4 py-2 font-medium transition-colors duration-200 hover:bg-gray-50"
            >
              เข้าสู่ระบบใหม่
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
