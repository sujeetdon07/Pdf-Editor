/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** AdSense publisher ID, e.g. ca-pub-1234567890123456. Ads stay off without it. */
  readonly VITE_ADSENSE_CLIENT?: string
  /** Ad unit IDs from the AdSense dashboard. */
  readonly VITE_ADSENSE_SLOT_ARTICLE?: string
  readonly VITE_ADSENSE_SLOT_FOOTER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
