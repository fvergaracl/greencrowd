import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingRoute from "@/lotties/onboarding_route.json"
import { useState } from "react"

// Step5: Route to complete the task

interface Step5Props {
  setStepNumber: (step: number) => void
}

export const Step5 = ({ setStepNumber }: Step5Props) => {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)

  return (
    <div
      key={key}
      className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'
    >
      <HeaderOnboarding
        stepNumber={5}
        setStepNumber={setStepNumber}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP5'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP5'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />

      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie animationData={onboardingRoute} loop className='w-2/3' />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Navigate to Your Destination")}
          </h2>
          <p className='text-gray-800 mt-4 text-lg'>
            {t(
              "A route has been generated to guide you to the point of interest. Follow the directions and reach the location to complete your task."
            )}
          </p>
          <p className='text-gray-800 mt-2 text-sm italic text-center text-weight-light'>
            {t(
              "Ensure your GPS is active for real-time updates and the best navigation experience."
            )}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className='mb-6 flex flex-col gap-4 w-full'
        >
          <button
            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={() => setStepNumber(6)}
          >
            {t("Continue")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
