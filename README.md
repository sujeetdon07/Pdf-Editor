# PDFTools

An iLovePDF-style web app with three tools, all running entirely in the browser — no server, no uploads.

- **Compress PDF** — re-encodes each page as JPEG at a chosen quality/scale and rebuilds the document, keeping the original page dimensions. Falls back to the original file if compression would make it bigger.
- **Image to PDF** — combines JPG/PNG/WebP images into one PDF, with fit-to-image / A4 / Letter page sizes, orientation, margin and page reordering.
- **PDF to Image** — renders every page to JPG or PNG at normal or high resolution, with per-page download or a ZIP of all pages.

## Stack

React + TypeScript + Vite, Tailwind CSS, [pdf-lib](https://pdf-lib.js.org/) for writing PDFs, [pdf.js](https://mozilla.github.io/pdf.js/) for rendering, JSZip for archives.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run lint
```

The build output in `dist/` is fully static and can be hosted on any static host (Netlify, Vercel, GitHub Pages, S3). Configure the host to rewrite unknown paths to `index.html` so client-side routes work on refresh.
