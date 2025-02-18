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

function openLocationSettings() {
  const userAgent = navigator.userAgent.toLowerCase()
  console.log({ userAgent })
  if (
    userAgent.includes("wv") ||
    (userAgent.includes("version/") && userAgent.includes("chrome/"))
  ) {
    // 🚀 WebView (Android) - Open system location settings
    window.location.href =
      "intent://settings#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end"
  } else if (userAgent.includes("chrome")) {
    // 🚀 Chrome Browser
    window.open("chrome://settings/content/location", "_blank")
  } else if (userAgent.includes("firefox")) {
    // 🚀 Firefox Browser
    window.open("about:preferences#privacy", "_blank")
  } else if (userAgent.includes("safari")) {
    // 🚀 Safari (iOS)
    Swal.fire({
      title: "Enable Location on iOS",
      text: "Go to: Settings > Privacy > Location Services > Safari, and set it to 'While Using the App'.",
      icon: "info",
      confirmButtonText: "OK"
    })
  } else {
    // 🚀 Default case for other browsers
    Swal.fire({
      title: "Enable Location",
      text: "Please open your browser settings and allow location access.",
      icon: "info",
      confirmButtonText: "OK"
    })
  }
}

export const Step4 = ({ setStepNumber }: Step4Props) => {
  const { t } = useTranslation()

  // Function to request location manually
  async function requestLocation() {
    if (!("geolocation" in navigator)) {
      Swal.fire({
        title: t("Geolocation Not Supported"),
        text: t("Your browser does not support geolocation."),
        icon: "warning",
        confirmButtonText: t("OK")
      })
      return
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation"
      })

      if (permissionStatus.state === "denied") {
        console.warn("⚠️ Location permission is permanently denied.")
        Swal.fire({
          title: t("Location Access Denied"),
          text: t(
            "Please enable location access manually in your browser settings."
          ),
          icon: "error",
          confirmButtonText: t("Open Settings"),
          showCancelButton: true
        }).then(result => {
          if (result.isConfirmed) {
            openLocationSettings()
          }
        })
        return
      }
    } catch (error) {
      console.error("Error checking location permissions:", error)
    }

    // 🚀 Intentar solicitar la ubicación
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("✅ Location enabled:", position)
        Swal.fire({
          title: t("Location Enabled!"),
          text: t("Thank you! Now you can access location-based campaigns."),
          icon: "success",
          confirmButtonText: t("Continue")
        }).then(() => {
          setStepNumber(5)
        })
      },
      error => {
        console.error("❌ Location access denied:", error)
        Swal.fire({
          title: t("Location Access Denied"),
          text: t(
            "We couldn't access your location. Please enable it in your device settings."
          ),
          icon: "error",
          confirmButtonText: t("Open Settings"),
          showCancelButton: true
        }).then(result => {
          if (result.isConfirmed) {
            openLocationSettings()
          }
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
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
