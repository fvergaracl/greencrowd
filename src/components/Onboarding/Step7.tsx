import { useRouter } from "next/router"
import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingRewards from "@/lotties/onboarding_rewards.json"
import { useState } from "react"

interface Step7Props {
  setStepNumber: (step: number) => void
}

export const Step7 = ({ setStepNumber }: Step7Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [key, setKey] = useState(0)

  const handleLogin = () => {
    router.push("/api/auth/login")
  }

  return (
    <div
      key={key}
      className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'
    >
      <HeaderOnboarding
        stepNumber={7}
        setStepNumber={setStepNumber}
        showSkip={false}
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP7'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />

      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie animationData={onboardingRewards} loop className='w-2/3' />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Earn Rewards for Your Contributions")}
          </h2>
          <p className='text-gray-800 mt-4 text-lg'>
            {t(
              "Every completed task earns you points! Your contributions help improve the platform and support citizen science initiatives."
            )}
          </p>
          <p className='text-gray-800 mt-2 text-sm'>
            {t("Stay engaged, level up, and unlock new opportunities.")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className='mb-6 flex flex-col w-full'
        >
          <button
            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={() => handleLogin()}
          >
            {t("Log In and Start Earning")}
          </button>
          <p className='text-sm text-gray-700 mt-4 text-center'>
            {t("By continuing, you agree to the contents of the") + " "}
            <a
              href='/consent_form.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              {t("Consent Form")}
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  )
}
