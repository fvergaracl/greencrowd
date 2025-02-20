import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingLocation from "@/lotties/onboarding_location.json"
import Swal from "sweetalert2"
import { useState } from "react"

// Step4: Enable location

interface Step4Props {
  setStepNumber: (step: number) => void
}

export const Step4 = ({ setStepNumber }: Step4Props) => {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)

  const requestLocation = async () => {
    if (!navigator.permissions || !navigator.geolocation) {
      Swal.fire({
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation.",
        icon: "warning",
        confirmButtonText: "OK"
      })
      return
    }

    const permission = await navigator.permissions.query({
      name: "geolocation"
    })

    if (permission.state === "denied") {
      Swal.fire({
        title: "Location Access Denied",
        text: "You have denied location access. Please enable it in your settings.",
        icon: "error",
        confirmButtonText: "OK"
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("Location enabled:", position)
        Swal.fire({
          title: "Location Enabled!",
          text: "Thank you! Now you can access location-based campaigns.",
          icon: "success",
          confirmButtonText: "Continue"
        }).then(() => setStepNumber(5))
      },
      error => {
        console.error("Location access denied:", error)
        Swal.fire({
          title: "Location Access Denied",
          text: "Please enable location access in your settings.",
          icon: "error",
          confirmButtonText: "OK"
        })
      }
    )
  }

  return (
    <div
      key={key}
      className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'
    >
      <HeaderOnboarding
        stepNumber={4}
        setStepNumber={setStepNumber}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP4'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP4'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />
      <div className='w-full bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 relative flex flex-col h-[90vh]'>
        <div className='flex justify-center mt-2'>
          <Lottie animationData={onboardingLocation} loop className='w-2/3' />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t("Enable Your Location")}
          </h2>
          <p className='text-gray-800 mt-4 text-lg'>
            {t(
              "To participate in campaigns, we need your location. This helps provide accurate data for environmental research."
            )}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className='mb-6 flex flex-col gap-4 w-full'
        >
          {/* Botón para Activar Ubicación */}
          <button
            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={requestLocation}
          >
            {t("Enable Location")}
          </button>

          {/* Botón para Continuar sin Activar Ubicación */}
          <button
            className='w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={() => setStepNumber(5)}
          >
            {t("Continue Without Location")}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
