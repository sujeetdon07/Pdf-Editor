/**
 * Single source of truth for routes, on-page copy and everything the build-time
 * prerenderer needs (titles, descriptions, sitemap, structured data).
 *
 * Plain JavaScript so `scripts/prerender.mjs` can import it directly under Node;
 * `site.d.ts` gives the app the types.
 */

export const SITE = {
  name: 'CelloPDF',
  url: 'https://cellopdf.vercel.app',
  tagline: 'Private, in-browser PDF workbench',
  description:
    'Free online PDF tools that run entirely in your browser: compress to a target size, merge, split, rotate and edit PDFs, and convert between PDF, Word, Excel, PowerPoint and images. No uploads, no sign-up.',
  email: 'hello@cellopdf.app',
}

/** @type {import('./site').ToolPage[]} */
export const TOOLS = [
  {
    path: '/compress-pdf',
    howTo: 'compress a PDF',
    label: 'Compress',
    group: 'Workbench',
    glyph: '⤓',
    heading: 'Compress PDF',
    title: 'Compress PDF online free — reduce PDF file size in your browser',
    description:
      'Shrink a PDF to an exact target size in KB or MB, or pick a quality preset. Runs in your browser, so the file is never uploaded.',
    card: 'Hit an exact target size in KB or MB, or pick a quality preset.',
    tag: 'Target size',
    intro:
      'Compress PDF reduces the size of a document by re-encoding its pages as images at a quality the tool searches for automatically. Give it a target of 200 KB and it repeatedly re-renders until it lands just under that size, so the file fits an upload limit on the first try.',
    steps: [
      'Select or drop the PDF you want to shrink.',
      'Choose a quality preset, or switch to target size and type the limit in KB or MB.',
      'Press Compress and watch the before and after sizes.',
      'Download the smaller PDF.',
    ],
    faqs: [
      {
        q: 'How small can a PDF get?',
        a: 'It depends on the content. Text-heavy scans typically drop by 70–90%; a PDF that is already optimised may barely change. The result panel always shows the exact saving.',
      },
      {
        q: 'Will the text stay selectable?',
        a: 'No. Compression rasterises pages, so the output is visually faithful but its text is no longer selectable. Use Split or Merge if you need to keep the original text layer.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'Only your device memory. Nothing is sent to a server, so there is no upload cap.',
      },
    ],
  },
  {
    path: '/merge-pdf',
    howTo: 'merge PDF files',
    label: 'Merge',
    group: 'Workbench',
    glyph: '⧉',
    heading: 'Merge PDF',
    title: 'Merge PDF files online free — combine PDFs in your browser',
    description:
      'Combine several PDFs into one document in any order, without re-encoding the pages. Entirely client-side and free.',
    card: 'Chain several PDFs into a single file without re-encoding pages.',
    tag: 'Lossless',
    intro:
      'Merge PDF copies the pages of every file you add into a single document, in the order you arrange them. Pages are copied as-is, so text stays selectable and quality is untouched.',
    steps: [
      'Add two or more PDF files.',
      'Drag them into the order you want.',
      'Press Merge PDFs.',
      'Download the combined document.',
    ],
    faqs: [
      {
        q: 'Does merging reduce quality?',
        a: 'No. Pages are copied byte for byte into the new document, so images, fonts and text layers are preserved exactly.',
      },
      {
        q: 'How many files can I merge?',
        a: 'There is no fixed limit — only what your browser can hold in memory at once.',
      },
      {
        q: 'Can I merge password-protected PDFs?',
        a: 'Encrypted files must be unlocked first; the tool will tell you when a file cannot be read.',
      },
    ],
  },
  {
    path: '/split-pdf',
    howTo: 'split a PDF',
    label: 'Split',
    group: 'Workbench',
    glyph: '⑂',
    heading: 'Split PDF',
    title: 'Split PDF online free — extract pages or ranges in your browser',
    description:
      'Pull page ranges out of a PDF, or explode a document into one file per page and download them as a ZIP. No uploads.',
    card: 'Pull out page ranges, or explode a document one page per file.',
    tag: 'Ranges · ZIP',
    intro:
      'Split PDF takes ranges such as 1-3, 7, 10-12 and produces a separate PDF for each one, or breaks the document apart so every page becomes its own file. Multiple outputs are bundled into a ZIP.',
    steps: [
      'Select the PDF you want to divide.',
      'Type the ranges you need, or choose one file per page.',
      'Press Split PDF.',
      'Download a single result or the ZIP with all of them.',
    ],
    faqs: [
      {
        q: 'What range formats are accepted?',
        a: 'Single pages and hyphenated ranges separated by commas, for example 1-3, 5, 9-12. Reversed or out-of-bounds ranges are rejected with a clear message.',
      },
      {
        q: 'Do the split files keep their text?',
        a: 'Yes. Pages are copied without re-encoding, so text, links and bookmarks on those pages survive.',
      },
      {
        q: 'Can I remove pages instead?',
        a: 'Yes — split out only the ranges you want to keep and merge them back together.',
      },
    ],
  },
  {
    path: '/rotate-pdf',
    howTo: 'rotate a PDF',
    label: 'Rotate',
    group: 'Workbench',
    glyph: '↻',
    heading: 'Rotate PDF',
    title: 'Rotate PDF online free — fix page orientation permanently',
    description:
      'Turn individual pages or a whole PDF by 90°, preview every page as a thumbnail and save the rotation permanently.',
    card: 'Fix orientation page by page with live thumbnails.',
    tag: 'Per page',
    intro:
      'Rotate PDF shows a thumbnail of every page so you can turn just the sideways ones. The rotation is written into the document, so it stays fixed in every reader — not just on screen.',
    steps: [
      'Select the PDF with pages facing the wrong way.',
      'Rotate individual pages, or turn the whole document at once.',
      'Press Apply rotation.',
      'Download the corrected PDF.',
    ],
    faqs: [
      {
        q: 'Is the rotation permanent?',
        a: 'Yes. It is stored in each page’s rotation property, so every PDF reader honours it.',
      },
      {
        q: 'Can I rotate by 180°?',
        a: 'Yes — press the same rotate button twice on the page you want flipped.',
      },
      {
        q: 'Does it re-compress anything?',
        a: 'No. Only the page rotation metadata changes; the content is untouched.',
      },
    ],
  },
  {
    path: '/edit-pdf',
    howTo: 'edit a PDF',
    label: 'Edit',
    group: 'Workbench',
    glyph: '✐',
    heading: 'Edit PDF',
    title: 'Edit PDF online free — add text, highlights and white-out',
    description:
      'Add text in any language, highlight passages and white out content anywhere on a PDF page, then save a new PDF. Nothing is uploaded.',
    card: 'Type text, highlight passages or white out anything, then save.',
    tag: 'Text · Marks',
    intro:
      'Edit PDF places new content on top of your pages: type text wherever you click, drag a highlight over a passage, or cover something with a white-out block. Edits are drawn by the browser, so Hindi, Chinese, Arabic and every other script work without installing a font.',
    steps: [
      'Select a PDF and wait for the page previews.',
      'Pick the text, highlight or white-out tool.',
      'Click to place text, or drag to draw a box. Undo removes the last edit.',
      'Press Apply, then download the edited PDF.',
    ],
    faqs: [
      {
        q: 'Can I change text that is already in the PDF?',
        a: 'Not directly. Existing text belongs to the original page; cover it with a white-out block and type the replacement on top.',
      },
      {
        q: 'Do my edits stay editable?',
        a: 'The saved PDF has the marks burned in as a transparent layer over each page, so they cannot be moved afterwards. Keep the original if you may need to redo them.',
      },
      {
        q: 'Is white-out safe for redaction?',
        a: 'It hides content visually and covers it with an opaque layer, but the original text may still exist underneath. For legal redaction, compress the result afterwards so the pages are rasterised.',
      },
    ],
  },
  {
    path: '/jpg-to-pdf',
    howTo: 'convert images to PDF',
    label: 'Image → PDF',
    group: 'Convert',
    glyph: '▣',
    heading: 'Image to PDF',
    title: 'JPG to PDF converter — turn images into one PDF, free and private',
    description:
      'Combine JPG, PNG or WebP images into a single PDF, choose A4, Letter or fit-to-image pages, and reorder before saving.',
    card: 'Bundle JPG, PNG or WebP files into one document, in your order.',
    tag: 'A4 · Letter · Fit',
    intro:
      'Image to PDF turns photos and scans into a document. Each image becomes a page, either fitted to a standard paper size with margins or sized exactly to the image.',
    steps: [
      'Add your JPG, PNG or WebP images.',
      'Drag them into the right order.',
      'Choose A4, US Letter or fit-to-image, plus portrait or landscape.',
      'Press Create PDF and download.',
    ],
    faqs: [
      {
        q: 'Which formats are supported?',
        a: 'JPG, PNG and WebP — anything your browser can decode.',
      },
      {
        q: 'Are the images re-compressed?',
        a: 'JPGs are embedded as they are; other formats are converted once. There is no second lossy pass.',
      },
      {
        q: 'Can I scan documents with my phone?',
        a: 'Yes. Photograph the pages, add them here in order and export one PDF.',
      },
    ],
  },
  {
    path: '/pdf-to-jpg',
    howTo: 'convert a PDF to images',
    label: 'PDF → Image',
    group: 'Convert',
    glyph: '◫',
    heading: 'PDF to Image',
    title: 'PDF to JPG converter — export pages as images at any DPI',
    description:
      'Turn PDF pages into JPG or PNG images at 36 to 600 DPI, download them one by one or as a ZIP. Runs in your browser.',
    card: 'Export pages as JPG or PNG at any DPI from 72 up to 600.',
    tag: 'Custom DPI',
    intro:
      'PDF to Image renders each page at the resolution you choose. 150 DPI suits the screen, 300 DPI matches print, and 600 DPI is there when you need to crop detail out of a page.',
    steps: [
      'Select the PDF you want to export.',
      'Choose JPG or PNG and set the DPI.',
      'Press Convert and review the page previews.',
      'Download single pages, or all of them as a ZIP.',
    ],
    faqs: [
      {
        q: 'Which DPI should I choose?',
        a: '150 DPI for screens and email, 300 DPI for printing, 600 DPI when you need to zoom into fine detail. Higher DPI means bigger files.',
      },
      {
        q: 'JPG or PNG?',
        a: 'JPG is far smaller for photographic pages; PNG is lossless and better for line art, screenshots and text you plan to edit.',
      },
      {
        q: 'Can I export just one page?',
        a: 'Every page gets its own download button, so you can take only the ones you need.',
      },
    ],
  },
  {
    path: '/word-to-pdf',
    howTo: 'convert Word to PDF',
    label: 'Word → PDF',
    group: 'Convert',
    glyph: '¶',
    heading: 'Word to PDF',
    title: 'Word to PDF converter — .docx to PDF in any language, free',
    description:
      'Convert .docx documents to paginated PDF in your browser, with full support for Hindi, Chinese, Arabic, Cyrillic and every other script.',
    card: 'Lay out a .docx as a paginated PDF, in any script or language.',
    tag: 'Any language',
    intro:
      'Word to PDF lays your document out with the browser’s own text engine and paginates the result, which is why scripts that usually break in converters — Devanagari, Arabic, CJK — come out correctly here.',
    steps: [
      'Select a .docx file.',
      'Choose the page size and orientation.',
      'Press Convert to PDF.',
      'Download the PDF.',
    ],
    faqs: [
      {
        q: 'Does it support non-English documents?',
        a: 'Yes. Text is rendered by your browser, so any language it can display — Hindi, Chinese, Japanese, Arabic, Russian and more — converts correctly.',
      },
      {
        q: 'Is the text in the PDF selectable?',
        a: 'No. Pages are rendered as images to guarantee the layout matches what the browser shows, which means the output is not searchable.',
      },
      {
        q: 'What about .doc files?',
        a: 'Only the modern .docx format is supported. Open an old .doc in Word or Google Docs and save it as .docx first.',
      },
    ],
  },
  {
    path: '/excel-to-pdf',
    howTo: 'convert Excel to PDF',
    label: 'Excel → PDF',
    group: 'Convert',
    glyph: '▤',
    heading: 'Excel to PDF',
    title: 'Excel to PDF converter — .xlsx and CSV to PDF tables, free',
    description:
      'Print .xlsx, .xlsm or .csv spreadsheets as clean PDF tables, one section per sheet, in any language and with no uploads.',
    card: 'Print .xlsx or .csv sheets as clean tables, one section per sheet.',
    tag: 'All sheets',
    intro:
      'Excel to PDF renders every sheet in the workbook as a titled table and paginates it across the page size you choose. CSV files are parsed with proper quoting, so commas inside values stay put.',
    steps: [
      'Select an .xlsx, .xlsm or .csv file.',
      'Pick the page size and orientation — landscape suits wide tables.',
      'Say whether the first row is a header.',
      'Press Convert to PDF and download.',
    ],
    faqs: [
      {
        q: 'Are all sheets included?',
        a: 'Yes. Each sheet becomes its own titled section in the PDF.',
      },
      {
        q: 'What about formulas and charts?',
        a: 'Calculated values are printed; charts, images and conditional formatting are not rendered.',
      },
      {
        q: 'Do wide tables get cut off?',
        a: 'Columns are fitted to the page width. Landscape orientation gives wide tables considerably more room.',
      },
    ],
  },
  {
    path: '/pdf-to-word',
    howTo: 'convert a PDF to Word',
    label: 'PDF → Word',
    group: 'Convert',
    glyph: '✎',
    heading: 'PDF to Word',
    title: 'PDF to Word converter — extract PDF text to .docx, free',
    description:
      'Recover the text of a PDF as an editable .docx document, keeping page breaks and heading sizes. Entirely client-side.',
    card: 'Recover the text of a PDF as an editable .docx you can keep working in.',
    tag: 'Editable',
    intro:
      'PDF to Word pulls the text stored in the PDF and rebuilds it as a Word document, keeping page breaks and relative heading sizes so the result is easy to keep working in.',
    steps: [
      'Select a PDF that contains real text.',
      'Press Convert to Word.',
      'Check the page and character count in the result panel.',
      'Download the .docx file.',
    ],
    faqs: [
      {
        q: 'Why is my PDF empty after converting?',
        a: 'It is probably a scan: the pages hold images rather than text. Extracting that needs OCR, which this tool does not perform.',
      },
      {
        q: 'Is the original layout preserved?',
        a: 'Text, paragraph order, page breaks and heading sizes are. Columns, tables and images are not reconstructed.',
      },
      {
        q: 'Does it work with other languages?',
        a: 'Yes. Whatever text is stored in the PDF comes across, in any script.',
      },
    ],
  },
  {
    path: '/pdf-to-excel',
    howTo: 'convert a PDF to Excel',
    label: 'PDF → Excel',
    group: 'Convert',
    glyph: '⊞',
    heading: 'PDF to Excel',
    title: 'PDF to Excel converter — extract PDF tables to .xlsx, free',
    description:
      'Turn tables in a PDF into an Excel workbook, one sheet per page, with columns detected from the layout. No uploads.',
    card: 'Lift tables out of a PDF into a workbook, one sheet per page.',
    tag: 'Tables',
    intro:
      'PDF to Excel reads where every piece of text sits on the page, groups it into rows by baseline and works out shared column edges, then writes one worksheet per page. Numbers can be stored as real numeric values so you can total them straight away.',
    steps: [
      'Select a PDF containing tables.',
      'Decide whether numbers should be stored as numbers.',
      'Press Convert to Excel.',
      'Download the .xlsx workbook.',
    ],
    faqs: [
      {
        q: 'How accurate is the table detection?',
        a: 'Columns are inferred from text positions, so clean grid-like tables come across faithfully. Merged cells, nested headers and free-flowing prose may need tidying afterwards.',
      },
      {
        q: 'Can it read scanned tables?',
        a: 'No. A scan has no text to position, so it needs OCR first — the tool tells you when this is the case.',
      },
      {
        q: 'Where do multi-page tables go?',
        a: 'Each PDF page becomes its own worksheet, so a table spanning three pages arrives as three sheets you can stack.',
      },
    ],
  },
  {
    path: '/powerpoint-to-pdf',
    howTo: 'convert PowerPoint to PDF',
    label: 'PPT → PDF',
    group: 'Convert',
    glyph: '◧',
    heading: 'PowerPoint to PDF',
    title: 'PowerPoint to PDF converter — .pptx to PDF, free and private',
    description:
      'Convert .pptx presentations to PDF, one page per slide at the deck’s own slide size, with text and pictures in any language.',
    card: 'Render a .pptx deck to PDF, one page per slide, in any language.',
    tag: 'Any language',
    intro:
      'PowerPoint to PDF opens the .pptx in your browser, reads the slide text, its positions and the pictures inside, and prints one page per slide at the deck’s own dimensions — no Office install and no server.',
    steps: [
      'Select a .pptx presentation.',
      'Press Convert to PDF.',
      'Wait while each slide is rendered.',
      'Download the PDF.',
    ],
    faqs: [
      {
        q: 'What is not converted?',
        a: 'Animations, transitions, speaker notes, theme backgrounds, charts and SmartArt are not rendered. Slide text, layout positions and embedded pictures are.',
      },
      {
        q: 'Does it handle other languages?',
        a: 'Yes. Slides are rendered by the browser, so Hindi, Chinese, Arabic, Russian and other scripts come out correctly.',
      },
      {
        q: 'Are .ppt files supported?',
        a: 'No, only the modern .pptx format. Re-save an old .ppt as .pptx first.',
      },
    ],
  },
  {
    path: '/pdf-to-powerpoint',
    howTo: 'convert a PDF to PowerPoint',
    label: 'PDF → PPT',
    group: 'Convert',
    glyph: '❏',
    heading: 'PDF to PowerPoint',
    title: 'PDF to PowerPoint converter — turn PDF pages into slides, free',
    description:
      'Convert a PDF into a .pptx deck with one slide per page, sized to match the page, ready to present or annotate.',
    card: 'Drop every PDF page onto its own slide, sized to match the page.',
    tag: 'Slide per page',
    intro:
      'PDF to PowerPoint renders each page at the resolution you pick and places it on its own slide, with the deck sized to match the PDF. It is the fastest way to present a document or annotate it in PowerPoint, Keynote or Google Slides.',
    steps: [
      'Select the PDF you want to present.',
      'Choose the slide resolution — higher is sharper but heavier.',
      'Press Convert to PowerPoint.',
      'Download the .pptx deck.',
    ],
    faqs: [
      {
        q: 'Can I edit the text on the slides?',
        a: 'No. Each slide holds a picture of the page, so the appearance is exact but the text is not separately editable. You can still add your own text boxes on top.',
      },
      {
        q: 'What slide size is used?',
        a: 'The deck matches the first page of the PDF, so A4 documents produce A4-shaped slides rather than letterboxed 16:9 ones.',
      },
      {
        q: 'Does it work with scanned PDFs?',
        a: 'Yes. Because pages are rendered as images, scans convert just as well as digital documents.',
      },
    ],
  },
]

/** @type {import('./site').ContentPage[]} */
export const PAGES = [
  {
    path: '/about',
    label: 'About',
    heading: 'About CelloPDF',
    title: 'About CelloPDF — private PDF tools that run in your browser',
    description:
      'CelloPDF is a free PDF workbench that processes every file inside your own browser. No uploads, no accounts, no tracking.',
    sections: [
      {
        heading: 'Why another PDF site?',
        body: [
          'Most online PDF tools work by uploading your document to somebody else’s server, converting it there and mailing you a link. That is fine for a holiday photo and unacceptable for a contract, a payslip or a medical report.',
          'CelloPDF was built the other way round. Every tool here runs as JavaScript inside the tab you already have open, using the same rendering engine your browser uses to display PDFs and web pages. The file is read from disk, processed in memory and handed straight back to you.',
        ],
      },
      {
        heading: 'What that means in practice',
        body: [
          'There is no upload progress bar, because there is no upload. There is no queue, no daily limit and no file size cap beyond what your device can hold. The tools keep working if your connection drops mid-task, and nothing you touch is ever logged.',
          'It also means speed depends on your machine rather than a shared server, and very large documents will use real memory while they are open.',
        ],
      },
      {
        heading: 'How it is built',
        body: [
          'The interface is React and Tailwind CSS. PDFs are parsed and rendered with PDF.js — the engine behind Firefox’s PDF viewer — and written with pdf-lib. Office files are unpacked in the browser and laid out with the browser’s own text engine, which is why documents in Hindi, Chinese, Arabic or Russian render correctly without shipping a font for every script.',
          'The whole site is a static bundle. There is no backend to store anything in.',
        ],
      },
    ],
  },
  {
    path: '/privacy',
    label: 'Privacy',
    heading: 'Privacy policy',
    title: 'Privacy policy — CelloPDF processes files locally, never uploads',
    description:
      'CelloPDF never uploads your documents. Read how files are handled, what data is collected and what third parties are involved.',
    sections: [
      {
        heading: 'Your files',
        body: [
          'Documents you open in CelloPDF are read by your browser and processed in your device’s memory. They are never transmitted to us or to any third party, and we have no server that could receive them.',
          'Results are produced as downloads created locally by your browser. Closing the tab discards everything.',
        ],
      },
      {
        heading: 'Data we collect',
        body: [
          'We do not ask for an account, an email address or any personal information, and the site sets no tracking cookies.',
          'The site is hosted on Vercel, which records standard server request logs such as IP address, timestamp and requested URL for the page and script files themselves. Web fonts are requested from Google Fonts, which receives the same kind of request data. Neither ever sees the contents of your documents.',
        ],
      },
      {
        heading: 'Changes and contact',
        body: [
          'If this policy changes, the updated version will be published on this page.',
          'Questions about privacy can be sent through the contact page.',
        ],
      },
    ],
  },
  {
    path: '/faq',
    label: 'FAQ',
    heading: 'Frequently asked questions',
    title: 'CelloPDF FAQ — how the free in-browser PDF tools work',
    description:
      'Answers about file privacy, supported formats, file size limits, offline use and the accuracy of each PDF conversion.',
    faqs: [
      {
        q: 'Are my files uploaded anywhere?',
        a: 'No. Every tool runs inside your browser, so documents never leave your device. You can confirm it by opening your browser’s network tab while converting, or by disconnecting from the internet after the page loads.',
      },
      {
        q: 'Is CelloPDF free?',
        a: 'Yes, every tool is free with no account, no watermark and no daily limit.',
      },
      {
        q: 'Does it work offline?',
        a: 'Once the page has loaded, the tools keep working without a connection, because the processing happens locally.',
      },
      {
        q: 'What is the maximum file size?',
        a: 'There is no imposed limit. The practical ceiling is your device’s memory — a few hundred megabytes is comfortable on a modern laptop, less on an older phone.',
      },
      {
        q: 'Which browsers are supported?',
        a: 'Current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.',
      },
      {
        q: 'Can it read scanned documents?',
        a: 'Tools that need text — PDF to Word and PDF to Excel — require a PDF with a real text layer. Scans hold only images and would need OCR, which CelloPDF does not do. Tools that work visually, such as compress or PDF to PowerPoint, handle scans fine.',
      },
      {
        q: 'Why is converted Office output not selectable text?',
        a: 'Word and Excel pages are rendered by the browser and placed as images so the layout is exact in every language. That accuracy comes at the cost of a searchable text layer.',
      },
      {
        q: 'Do you support languages other than English?',
        a: 'Yes. Rendering goes through your browser’s text engine, so Hindi, Bengali, Tamil, Chinese, Japanese, Korean, Arabic, Hebrew, Russian and other scripts all work.',
      },
    ],
  },
  {
    path: '/contact',
    label: 'Contact',
    heading: 'Contact',
    title: 'Contact CelloPDF — report a bug or request a tool',
    description:
      'Report a problem, request a new PDF tool or ask a question about how CelloPDF handles your files.',
    sections: [
      {
        heading: 'Get in touch',
        body: [
          'Found a document that will not convert, or a tool that behaves oddly? Tell us what you were doing, which browser you used and what happened instead — that is usually enough to reproduce and fix it.',
          `Email ${SITE.email} and we will read it. Because files never leave your device, please describe the problem rather than attaching a confidential document.`,
        ],
      },
      {
        heading: 'Feature requests',
        body: [
          'Missing a tool you use elsewhere? Say which one and what you need it for. Requests that can be done safely in the browser are the ones most likely to be built.',
        ],
      },
    ],
  },
  {
    path: '/terms',
    label: 'Terms',
    heading: 'Terms of use',
    title: 'Terms of use — CelloPDF',
    description: 'The terms under which the free CelloPDF in-browser PDF tools are provided.',
    sections: [
      {
        heading: 'The service',
        body: [
          'CelloPDF is provided free of charge and as-is, without warranty of any kind. The tools run on your own device, and you are responsible for keeping a copy of any original document before processing it.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Use the tools only with documents you have the right to process. Do not use the site to infringe copyright, remove protections you are not entitled to remove, or break any applicable law.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'To the fullest extent permitted by law, we accept no liability for data loss, corrupted output or any damage arising from use of the site. Verify important output before relying on it.',
        ],
      },
    ],
  },
]

export const NAV_GROUPS = ['Workbench', 'Convert'].map((label) => ({
  label,
  items: TOOLS.filter((tool) => tool.group === label),
}))

export const HOME = {
  path: '/',
  title: `${SITE.name} — free online PDF tools that never upload your files`,
  description: SITE.description,
}

/** Every indexable route, used for the sitemap and for prerendering. */
export const ROUTES = [HOME, ...TOOLS, ...PAGES]
