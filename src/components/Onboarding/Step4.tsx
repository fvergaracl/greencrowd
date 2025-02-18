import { useTranslation } from "@/hooks/useTranslation"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { HeaderOnboarding } from "@/components/Onboarding/HeaderOnboarding"
import onboardingLocation from "@/lotties/onboarding_location.json"
import Swal from "sweetalert2"
// Step4: Enable location

interface Step4Props {
  setStepNumber: (step: number) => void
}

export const Step4 = ({ setStepNumber }: Step4Props) => {
  const { t } = useTranslation()

  // Function to request location manually
  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log("Location enabled:", position)

          // Show success message and move to the next step
          Swal.fire({
            title: t("Location Enabled!"),
            text: t("Thank you! Now you can access location-based campaigns."),
            icon: "success",
            confirmButtonText: t("Continue")
          }).then(() => {
            setStepNumber(5) // Move to the next step
          })
        },
        error => {
          console.error("Location access denied:", error)
          Swal.fire({
            title: t("Location Access Denied"),
            text: t("Please enable location access in your settings."),
            icon: "error",
            confirmButtonText: t("OK")
          })
        }
      )
    } else {
      Swal.fire({
        title: t("Geolocation Not Supported"),
        text: t("Your browser does not support geolocation."),
        icon: "warning",
        confirmButtonText: t("OK")
      })
    }
  }

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-green-400 p-4'>
      <HeaderOnboarding setStepNumber={setStepNumber} />

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
