/**
 * Advertising consent. Ads stay off until the visitor accepts, which is what
 * the ePrivacy directive requires and what Google's consent mode expects, so
 * the AdSense script is never even fetched for someone who declined.
 */
const KEY = 'cellopdf.consent.v1'
const EVENT = 'cellopdf:consent'

export type Consent = 'granted' | 'denied' | 'unset'

export function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(KEY)
    return value === 'granted' || value === 'denied' ? value : 'unset'
  } catch {
    return 'unset'
  }
}

export function setConsent(consent: Exclude<Consent, 'unset'>): void {
  try {
    window.localStorage.setItem(KEY, consent)
  } catch {
    // Nothing stored means the banner reappears next visit, which is safe.
  }
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: consent }))
}

/** Footer entry point: clears the choice so the banner can be answered again. */
export function resetConsent(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: 'unset' }))
}

export function onConsentChange(listener: (consent: Consent) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<Consent>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
