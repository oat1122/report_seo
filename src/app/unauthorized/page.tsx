import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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

          <h1 className="text-2xl font-bold text-text-dark mb-2">
            ไม่มีสิทธิ์เข้าถึง
          </h1>

          <p className="text-gray-600 mb-6">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
            กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-primary-purple hover:bg-accent-purple-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              กลับไปหน้าหลัก
            </Link>

            <Link
              href="/login"
              className="w-full border border-gray-300 hover:bg-gray-50 text-text-dark font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              เข้าสู่ระบบใหม่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
