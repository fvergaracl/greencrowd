/**
 * Retrieves the device's heading using the `deviceorientation` event.
 * Falls back to a timeout if no data is received.
 *
 * @param timeoutMs - The maximum time to wait for heading data (default: 3000ms).
 * @returns A promise that resolves with the heading in degrees or `null` if unavailable.
 */
export const getDeviceHeading = async (
  timeoutMs = 3000
): Promise<number | null> => {
  return new Promise<number | null>(resolve => {
    let timeoutId: NodeJS.Timeout | null = null

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha === "number") {
        cleanup()
        resolve(event.alpha)
      }
    }

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener("deviceorientationabsolute", handleOrientation)
      window.removeEventListener("deviceorientation", handleOrientation)
    }

    window.addEventListener("deviceorientationabsolute", handleOrientation, {
      once: true
    })
    window.addEventListener("deviceorientation", handleOrientation, {
      once: true
    })

    timeoutId = setTimeout(() => {
      console.warn("⚠️ Heading detection timed out.")
      cleanup()
      resolve(null)
    }, timeoutMs)
  })
}
