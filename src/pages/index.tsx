import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/router"
import { motion, AnimatePresence } from "framer-motion"
import { logEvent } from "@/utils/logger"
import decodeJwt from "@/utils/getDecodedToken"
import Lottie from "lottie-react"
import onboardingBearLoading from "@/lotties/onboarding_bear_loading.json"
import { useTranslation } from "@/hooks/useTranslation"

import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7
} from "@/components/Onboarding"
import { a } from "framer-motion/dist/types.d-6pKw1mTI"

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

const stepTransition = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.4, ease: "backInOut" }
}

const stepsMap: Record<StepNumber, typeof Step1> = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
  6: Step6,
  7: Step7
}

export default function Home() {
  const { t } = useTranslation()
  const router = useRouter()
  const [stepNumber, setStepNumber] = useState<StepNumber>(1)
  const [loading, setLoading] = useState(true)

  const goToStep = useCallback((step: StepNumber) => {
    logEvent("ONBOARDING_STEP_CHANGED", `Step changed to ${step}`, { step })

    if (stepsMap[step]) {
      setStepNumber(step)
    }
  }, [])

  useEffect(() => {
    if (!router.isReady) return

    logEvent("ONBOARDING_RENDERED", "Onboarding screen rendered", {
      step: stepNumber
    })

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include"
        })
        if (!response.ok) {
          setLoading(false)
          console.warn("User is not logged in")
          return
        }
        const { access_token } = await response.json()
        const decodedToken = decodeJwt(access_token)

        if (decodedToken) {
          logEvent("ONBOARDING_USER_LOGGED_IN", "User is already logged in", {
            user: decodedToken
          })
          router.push("/dashboard")
        }
      } catch (error) {
        setLoading(false)
        console.error("Error fetching token:", error)
      }
    }

    fetchToken()
  }, [router.isReady])

  const CurrentStep = stepsMap[stepNumber] ?? Step1

  if (loading) {
    return (
      <div className='h-screen bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center relative overflow-hidden'>
        <Lottie animationData={onboardingBearLoading} loop className='w-2/3' />
        <div className='absolute w-full flex items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          >
            <p
              className='text-white text-lg font-semibold'
              style={{
                marginTop: "7rem"
              }}
            >
              {t("Loading...")}
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen-dvh flex items-center justify-center pt-safe-top pb-safe-bottom bg-gradient-to-r from-blue-400 to-green-400 relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={stepNumber}
          {...stepTransition}
          className='w-full flex items-center justify-center'
        >
          <CurrentStep setStepNumber={goToStep} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
