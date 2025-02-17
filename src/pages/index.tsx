import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { setCookies, getCookie } from "@/utils/cookies"
import { Step1, Step2 } from "@/components/Onboarding"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const { t } = useTranslation()
  const [stepNumber, setStepNumber] = useState<number>(1)

  // Recuperar el paso desde cookies al cargar
  useEffect(() => {
    const savedStep = getCookie("onboarding_step")
    if (savedStep) {
      const step = Number(savedStep)
      if (!isNaN(step)) {
        setStepNumber(step)
      }
    }
  }, [])

  return (
    <div className='h-screen bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={stepNumber} // Clave única para animación de cambio
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "backInOut" }}
          className='absolute w-full flex items-center justify-center'
        >
          {stepNumber === 1 ? (
            <Step1 setStepNumber={setStepNumber} />
          ) : (
            <Step2 />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
