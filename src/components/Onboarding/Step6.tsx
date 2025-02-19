import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingCompletingTask from "@/lotties/onboarding_task_completing.json"

// Step6: Completing the assigned task
interface Step6Props {
  setStepNumber: (step: number) => void
}

export const Step6 = ({ setStepNumber }: Step6Props) => {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'>
        <HeaderOnboarding
        stepNumber={6}
        setStepNumber={setStepNumber}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP6'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP6'
      />

      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie
            animationData={onboardingCompletingTask}
            loop
            className='w-2/3'
          />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Complete Your Task")}
          </h2>

          <p className='text-gray-800 mt-2 text-lg'>
            {t("Once finished, submit your task and confirm completion.")}
          </p>
          <p className='text-gray-800 mt-2 text-sm italic text-center'>
            {t("Ensure all necessary data is collected before submitting.")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className='mb-6 flex flex-col gap-4 w-full'
        >
          <button
            className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={() => setStepNumber(7)}
          >
            {t("Continue")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
