import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ADSENSE_CLIENT, adsEnabled, loadAdsense, pushAd } from '../lib/ads'
import { onConsentChange, readConsent } from '../lib/consent'

interface AdSlotProps {
  /** Ad unit ID from the AdSense dashboard. */
  slot: string
  format?: string
  className?: string
}

/**
 * One AdSense unit. Renders nothing at all until a publisher ID is configured
 * and the visitor has consented, and remounts on navigation because AdSense
 * refuses to fill an <ins> it has already processed.
 */
export default function AdSlot({ slot, format = 'auto', className }: AdSlotProps) {
  const { pathname } = useLocation()
  const [granted, setGranted] = useState(false)
  const ins = useRef<HTMLModElement>(null)

  useEffect(() => {
    setGranted(readConsent() === 'granted')
    return onConsentChange((consent) => setGranted(consent === 'granted'))
  }, [])

  useEffect(() => {
    if (!granted || !ins.current) return
    loadAdsense()
    pushAd()
  }, [granted, pathname])

  if (!adsEnabled() || !slot || !granted) return null

  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-500">Advertisement</p>
      <ins
        key={pathname}
        ref={ins}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  )
}
