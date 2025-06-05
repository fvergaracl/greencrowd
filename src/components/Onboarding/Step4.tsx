import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingLocation from "@/lotties/onboarding_location.json"
import Swal from "sweetalert2"
import { useState } from "react"

interface Step4Props {
  setStepNumber: (step: number) => void
}

export const Step4 = ({ setStepNumber }: Step4Props) => {
  const { t } = useTranslation()
  const [key, setKey] = useState(0)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation.",
        icon: "warning",
        confirmButtonText: "OK"
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("✅ Location:", position)
        Swal.fire({
          title: "Location Enabled!",
          text: "Thank you! Now you can access location-based campaigns.",
          icon: "success",
          confirmButtonText: "Continue"
        }).then(() => setStepNumber(5))
      },
      error => {
        console.error("🚫 Location error:", error)
        let message =
          "Please enable location access in your device or browser settings."
        let showSettingsOption = false

        if (error.code === 1) {
          message =
            "Permission denied. Please enable location access in system settings."
          showSettingsOption = true
        } else if (error.code === 2) {
          message = "Location unavailable. Please try again later."
        } else if (error.code === 3) {
          message = "Request timed out. Try again in an open area."
        }

        Swal.fire({
          title: "Location Access Failed",
          text: message,
          icon: "error",
          confirmButtonText: showSettingsOption ? "Open Settings" : "OK",
          showCancelButton: showSettingsOption
        }).then(result => {
          if (showSettingsOption && result.isConfirmed) {
            if (/Android/i.test(navigator.userAgent)) {
              // Esto puede abrir los ajustes de la app en Android
              window.open(
                "intent://settings#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end;",
                "_blank"
              )
            } else {
              Swal.fire({
                title: "Manual Action Required",
                text: "Please go to your browser or system settings and enable location access manually.",
                icon: "info",
                confirmButtonText: "OK"
              })
            }
          }
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div
      key={key}
      className='min-h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4 flex flex-col items-center'
    >
      <HeaderOnboarding
        stepNumber={4}
        setStepNumber={setStepNumber}
        eventNameSkip='ONBOARDING_SKIP_ON_STEP4'
        eventNameLanguage='ONBOARDING_LANGUAGE_CHANGED_ON_STEP4'
        onLanguageChange={() => setKey(prev => prev + 1)}
      />

      <div className='w-full max-w-2xl bg-white bg-opacity-30 rounded-2xl shadow-lg text-center p-6 flex flex-col flex-grow overflow-auto mt-4'>
        <div className='flex justify-center max-h-60 overflow-hidden mb-4'>
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
          className='mt-6 flex flex-col gap-4 w-full'
        >
          <button
            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md'
            onClick={requestLocation}
          >
            {t("Enable Location")}
          </button>
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
