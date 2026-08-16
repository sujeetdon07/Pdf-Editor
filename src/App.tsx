import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ContentPage from './pages/ContentPage'
import NotFound from './pages/NotFound'
import { PAGES } from './content/site'

const CompressPdf = lazy(() => import('./pages/CompressPdf'))
const ImageToPdf = lazy(() => import('./pages/ImageToPdf'))
const PdfToImage = lazy(() => import('./pages/PdfToImage'))
const MergePdf = lazy(() => import('./pages/MergePdf'))
const SplitPdf = lazy(() => import('./pages/SplitPdf'))
const RotatePdf = lazy(() => import('./pages/RotatePdf'))
const WordToPdf = lazy(() => import('./pages/WordToPdf'))
const ExcelToPdf = lazy(() => import('./pages/ExcelToPdf'))
const PdfToWord = lazy(() => import('./pages/PdfToWord'))
const PdfToExcel = lazy(() => import('./pages/PdfToExcel'))
const PowerpointToPdf = lazy(() => import('./pages/PowerpointToPdf'))
const PdfToPowerpoint = lazy(() => import('./pages/PdfToPowerpoint'))
const EditPdf = lazy(() => import('./pages/EditPdf'))

function Loading() {
  return <p className="text-sm text-ink-500">Loading tool…</p>
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="compress-pdf" element={<CompressPdf />} />
          <Route path="jpg-to-pdf" element={<ImageToPdf />} />
          <Route path="pdf-to-jpg" element={<PdfToImage />} />
          <Route path="merge-pdf" element={<MergePdf />} />
          <Route path="split-pdf" element={<SplitPdf />} />
          <Route path="rotate-pdf" element={<RotatePdf />} />
          <Route path="word-to-pdf" element={<WordToPdf />} />
          <Route path="excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="pdf-to-word" element={<PdfToWord />} />
          <Route path="pdf-to-excel" element={<PdfToExcel />} />
          <Route path="powerpoint-to-pdf" element={<PowerpointToPdf />} />
          <Route path="pdf-to-powerpoint" element={<PdfToPowerpoint />} />
          <Route path="edit-pdf" element={<EditPdf />} />
          {PAGES.map((page) => (
            <Route key={page.path} path={page.path} element={<ContentPage />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
