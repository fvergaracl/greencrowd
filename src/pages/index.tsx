import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"

/**
 * Reads a specific cookie value from the browser
 */
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null // Prevents issues in SSR
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

export default function Home() {
  const { t } = useTranslation()
  const router = useRouter()
  const [flashMessage, setFlashMessage] = useState<string | null>(null)

  useEffect(() => {
    // Read `flash_message` cookie on the client side
    const message = getCookie("flash_message")
    if (message) {
      setFlashMessage(message)

      // Clear the cookie after reading it
      document.cookie =
        "flash_message=; Path=/; Max-Age=0; SameSite=Lax; Secure"

      // Auto-hide after 5 seconds
      setTimeout(() => setFlashMessage(null), 5000)
    }
  }, [])

  const handleLogin = () => {
    router.push("/api/auth/login")
  }

  return (
    <div className='h-screen bg-gradient-to-b from-gray-900 to-gray-700 flex items-center justify-center'>
      <div className='w-11/12 max-w-sm bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col items-center'>
        <div className='bg-gray-900 w-32 h-32 flex items-center justify-center rounded-full mb-6'>
          <img
            src='/images/GREENGAGE_white_logo.png'
            alt='GREENGAGE Logo'
            className='w-28 h-28 object-contain'
          />
        </div>
        <h1 className='text-2xl font-bold text-white mb-4 text-center'>
          {t("Welcome to GREENGAGE")}
        </h1>
        {flashMessage && (
          <p className='mb-4 text-center text-yellow-400'>{t(flashMessage)}</p>
        )}
        <p className='text-center text-gray-300 mb-6'>
          {t("A simple app to manage your campaigns")}
        </p>
        {process?.env?.GIT_COMMIT_HASH && (
          <small className='text-center text-gray-300 mb-6'>
            {t("Commit hash")}: {process.env.GIT_COMMIT_HASH}
          </small>
        )}
        <button
          onClick={handleLogin}
          className='w-full py-3 text-white font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-all'
        >
          {t("Log in")}
        </button>
      </div>
    </div>
  )
}
