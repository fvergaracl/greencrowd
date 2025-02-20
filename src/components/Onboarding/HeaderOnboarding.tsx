import { useTranslation } from "@/hooks/useTranslation"
import LanguageDropdown from "@/components/Common/LanguageDropdown"
import Lottie from "lottie-react"
import onboardingRightArrowUp from "@/lotties/onboarding_right_arrow_up.json"
import { logEvent } from "@/utils/logger"
interface HeaderOnboardingProps {
  stepNumber: number
  setStepNumber: (step: number) => void
  showArrow?: boolean
  showSkip?: boolean
  eventNameSkip?: string
  eventNameLanguage?: string
  onLanguageChange?: () => void
}

export const HeaderOnboarding = ({
  stepNumber,
  setStepNumber,
  showArrow = false,
  showSkip = true,
  eventNameSkip,
  eventNameLanguage,
  onLanguageChange
}: HeaderOnboardingProps) => {
  const { t } = useTranslation()

  let classNameForDiv =
    "absolute top-0 left-0 right-0 flex justify-between px-4 py-2"
  if (!showSkip) {
    classNameForDiv = "absolute top-1 right-1"
  }

  return (
    <>
      <div className={classNameForDiv}>
        {showSkip && (
          <button
            className='text-gray-700 hover:text-gray-900 font-bold text-lg'
            onClick={() => {
              logEvent(
                eventNameSkip || "ONBOARDING_SKIP_CLICKED",
                `User skipped onboarding at step ${stepNumber}`,
                {
                  step: stepNumber
                }
              )
              setStepNumber(7)
            }}
          >
            {t("Skip")}
          </button>
        )}

        <LanguageDropdown
          showLabel={false}
          eventNameLanguage={eventNameLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>
      {showArrow && (
        <div className='absolute top-10 right-10'>
          <Lottie
            animationData={onboardingRightArrowUp}
            loop={true}
            className='w-20 h-20 scale-x-[-1]'
          />
        </div>
      )}
    </>
  )
}
