import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
// Step1: Welcome Screen
interface Step1Props {
  setStepNumber: (step: number) => void
}

export const Step1 = ({ setStepNumber }: Step1Props) => {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'>
      <HeaderOnboarding setStepNumber={setStepNumber} />
      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        {/* Logo at the top */}

        <div className='flex justify-center mt-4'>
          <img
            src='/icons/icon-512x512.png'
            alt='GreenCrowd Logo'
            className=' rounded-full shadow-md'
          />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            {t("Welcome to")}
          </h1>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text'>
            GreenCrowd!
          </h1>
          <p className='text-gray-800 mt-4 text-lg'>
            {t(
              "Join the movement! Collect geolocated data to support citizen science and environmental research"
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
            onClick={() => setStepNumber(2)}
          >
            {t("Start Exploring")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
