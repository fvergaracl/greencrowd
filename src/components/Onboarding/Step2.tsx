import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import Lottie from "lottie-react"
import onboardingLanguagesAnimation from "@/lotties/onboarding_languages.json"
import onboardingRightArrowUp from "@/lotties/onboarding_right_arrow_up.json"
import { useState } from "react"

// Step2: Select Language
interface Step2Props {
  setStepNumber: (step: number) => void
}

export const Step2 = ({ setStepNumber }: Step2Props) => {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)

  return (
    <div
      key={key}
      className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'
    >
      <HeaderOnboarding
        stepNumber={2}
        setStepNumber={setStepNumber}
        showArrow={true}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP2'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP2'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />

      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie animationData={onboardingLanguagesAnimation} loop={true} />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Select your language")}
          </h2>
          <p className='text-gray-800 mt-4 text-lg'>
            {t("Choose your preferred language to enhance your experience")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className='mb-6'
        >
          <button
            className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={() => setStepNumber(3)}
          >
            {t("Continue")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
