import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import { useState } from "react"
import Lottie from "lottie-react"
import onboardingSelectCampaign from "@/lotties/onboarding_select_campaign.json"
// Step2: Select Campaign

interface Step3Props {
  setStepNumber: (step: number) => void
}

export const Step3 = ({ setStepNumber }: Step3Props) => {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)

  return (
    <div
      key={key}
      className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'
    >
      <HeaderOnboarding
        stepNumber={3}
        setStepNumber={setStepNumber}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP3'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP3'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />

      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie animationData={onboardingSelectCampaign} loop={true} />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Select Your Campaign")}
          </h2>
          <p className='text-gray-800 mt-4 text-lg'>
            {t(
              "Browse and choose a campaign to contribute to. Your participation helps advance citizen science and environmental research."
            )}
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
            onClick={() => setStepNumber(4)}
          >
            {t("Continue")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
