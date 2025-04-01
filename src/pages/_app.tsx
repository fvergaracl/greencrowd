import "@/sentry.client.config"
import "leaflet/dist/leaflet.css"
import "../styles/globals.css"
import { StrictMode, ReactNode, useEffect, useState } from "react"
import { AppProps } from "next/app"
import { useRouter } from "next/router"
import { DashboardProvider } from "@/context/DashboardContext"
import { AdminProvider } from "@/context/AdminContext"

// import enhanceConsole from "@/utils/enhanceConsole"

// if (typeof window !== "undefined") {
//   let isEnhanced = (window as any).__ENHANCED_CONSOLE__ || false
//   if (!isEnhanced) {
//     enhanceConsole()
//     ;(window as any).__ENHANCED_CONSOLE__ = true
//   }
// }

export default function MyApp({ Component, pageProps }: AppProps) {
  const [configLoaded, setConfigLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadRuntimeConfig = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "/runtime-config.js"
        script.async = false
        script.onload = () => {
          console.log("[+] runtime-config.js cargado:", window.__ENV__)
          setConfigLoaded(true)
          resolve()
        }
        script.onerror = () => {
          console.error("[-] Error cargando runtime-config.js")
          reject()
        }
        document.body.appendChild(script)
      })
    }

    loadRuntimeConfig().catch(() =>
      console.error("No se pudo cargar la configuración en runtime.")
    )
  }, [])

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(reg => console.log("SW Registered", reg.scope))
        .catch(err => console.error("SW Error", err))
    }
  }, [])

  if (!configLoaded) {
    return <></>
  }

  const contextMapping: Record<
    string,
    ({ children }: { children: ReactNode }) => JSX.Element
  > = {
    "/dashboard": DashboardProvider,
    "/admin": AdminProvider
  }

  const matchedProvider = Object.entries(contextMapping).find(([path]) =>
    router.pathname.startsWith(path)
  )?.[1]

  const WrappedComponent = matchedProvider
    ? withProvider(Component, matchedProvider)
    : Component

  return (
    <StrictMode>
      <WrappedComponent {...pageProps} />
    </StrictMode>
  )
}

/**
 * Higher Order Component para envolver un componente en un Provider
 */
const withProvider = (
  Component: AppProps["Component"],
  Provider: ({ children }: { children: ReactNode }) => JSX.Element
) => {
  const WrappedComponent = (props: AppProps) => (
    <Provider>
      <Component {...props.pageProps} />
    </Provider>
  )

  WrappedComponent.displayName = `WithProvider(${Component.displayName || Component.name || "Anonymous"})`

  return WrappedComponent
}
