/**
 * AdSense wiring. The publisher ID comes from VITE_ADSENSE_CLIENT at build
 * time: with no ID the site renders exactly as before, so nothing breaks
 * while the AdSense application is still pending.
 */
const SCRIPT_ID = 'adsense-loader'

export const ADSENSE_CLIENT: string = import.meta.env.VITE_ADSENSE_CLIENT ?? ''

export const AD_SLOTS = {
  article: import.meta.env.VITE_ADSENSE_SLOT_ARTICLE ?? '',
  footer: import.meta.env.VITE_ADSENSE_SLOT_FOOTER ?? '',
}

export function adsEnabled(): boolean {
  return ADSENSE_CLIENT.startsWith('ca-pub-')
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/** Injects the AdSense loader once, only after consent has been granted. */
export function loadAdsense(): void {
  if (!adsEnabled() || document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  document.head.append(script)
}

export function pushAd(): void {
  try {
    window.adsbygoogle = window.adsbygoogle ?? []
    window.adsbygoogle.push({})
  } catch {
    // A blocked or not-yet-loaded script must never break the tools.
  }
}
