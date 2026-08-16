import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CompressPdf from './pages/CompressPdf'
import ImageToPdf from './pages/ImageToPdf'
import PdfToImage from './pages/PdfToImage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="compress-pdf" element={<CompressPdf />} />
        <Route path="jpg-to-pdf" element={<ImageToPdf />} />
        <Route path="pdf-to-jpg" element={<PdfToImage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
