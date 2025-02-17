import { useState, useCallback } from "react"
import { Step1, Step2, Step3, Step4 } from "@/components/Onboarding"
import { motion, AnimatePresence } from "framer-motion"

type StepNumber = 1 | 2 | 3 | 4

export default function Home() {
  const [stepNumber, setStepNumber] = useState<StepNumber>(1)

  const steps = [Step1, Step2, Step3, Step4]

  const goToStep = useCallback(
    (step: StepNumber) => {
      if (step >= 1 && step <= steps.length) {
        setStepNumber(step)
      }
    },
    [steps.length]
  )

  const CurrentStep = steps[stepNumber - 1]

  return (
    <div className='h-screen bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={stepNumber}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "backInOut" }}
          className='absolute w-full flex items-center justify-center'
        >
          <CurrentStep setStepNumber={goToStep} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
