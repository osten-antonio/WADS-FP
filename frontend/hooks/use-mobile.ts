import * as React from "react"

const MOBILE_BREAKPOINT = 768
const XL_BREAKPOINT = 1280

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsBelowXl() {
  const [isBelowXl, setIsBelowXl] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${XL_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsBelowXl(window.innerWidth < XL_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsBelowXl(window.innerWidth < XL_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isBelowXl
}
