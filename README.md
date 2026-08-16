# CelloPDF

A private PDF workbench that runs entirely in the browser — no server, no uploads, no accounts.

- **Compress PDF** — quality presets, or a **target file size**: the document is re-rasterised at progressively lower DPI/JPEG quality until it fits the size you asked for. Falls back to the original file if compression would make it bigger.
- **Image to PDF** — combines JPG/PNG/WebP images into one PDF, with fit-to-image / A4 / Letter page sizes, orientation, margin and page reordering.
- **PDF to Image** — renders pages to JPG or PNG at a **custom DPI** (36–600, presets for 72/150/300/600), with per-page download or a ZIP of all pages.
- **Merge PDF** — concatenates several PDFs in a reorderable list.
- **Split PDF** — extracts custom page ranges (`1-3, 5`) or splits every page into its own PDF, downloadable individually or as a ZIP.
- **Rotate PDF** — page thumbnails with per-page or whole-document rotation, applied on top of each page's existing rotation.
- **Word to PDF** — `.docx` converted to HTML with Mammoth, laid out by the browser and paginated into A4/Letter pages.
- **Excel to PDF** — `.xlsx`, `.xlsm` and `.csv` rendered as one titled table per sheet, with an optional header row and numeric alignment.
- **PDF to Word** — extracts selectable text with pdf.js and rebuilds it as an editable `.docx` (headings inferred from font size). Scanned PDFs have no text layer and would need OCR.

Word and Excel pages are rendered by the browser's own text engine, so CJK, Devanagari, Arabic, Cyrillic and other scripts come out correctly without embedding fonts; the resulting PDF pages are images rather than selectable text.

## Stack

React + TypeScript + Vite, Tailwind CSS (dark "aurora" theme, Space Grotesk + Inter), [pdf-lib](https://pdf-lib.js.org/) for writing PDFs, [pdf.js](https://mozilla.github.io/pdf.js/) for rendering, JSZip for archives, Mammoth (`.docx` → HTML), ExcelJS (spreadsheets), html2canvas (page rasterisation) and `docx` (Word output).

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run lint
```

The build output in `dist/` is fully static and can be hosted on any static host (Netlify, Vercel, GitHub Pages, S3). Configure the host to rewrite unknown paths to `index.html` so client-side routes work on refresh.
