import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adsEnabled } from '../lib/ads'
import { onConsentChange, readConsent, setConsent } from '../lib/consent'

/**
 * Cookie notice for advertising. It only appears once a publisher ID is
 * configured — with no ads the site sets no cookies at all, and asking about
 * them would be noise.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!adsEnabled()) return
    setVisible(readConsent() === 'unset')
    return onConsentChange((consent) => setVisible(consent === 'unset'))
  }, [])

  if (!visible) return null

  const choose = (consent: 'granted' | 'denied') => {
    setConsent(consent)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 px-4 py-4 backdrop-blur sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-300">
          Your documents stay on your device either way. We would like to show ads, which set
          cookies — decline and no advertising script is loaded at all. See the{' '}
          <Link to="/privacy" className="text-iris-300 underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="btn-ghost" onClick={() => choose('denied')}>
            Decline
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => choose('granted')}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
