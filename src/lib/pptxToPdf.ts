import JSZip from 'jszip'
import { fixedPagesToPdf } from './htmlToPdf'

/** English Metric Units per CSS pixel (914400 EMU per inch, 96 px per inch). */
const EMU_PER_PX = 9525
/** Fallback slide size (16:9) for decks that omit p:sldSz. */
const DEFAULT_SLIDE = { width: 12192000 / EMU_PER_PX, height: 6858000 / EMU_PER_PX }

interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface TextRun {
  text: string
  size: number
  bold: boolean
  italic: boolean
  color: string
}

interface TextBlock extends Box {
  align: string
  paragraphs: TextRun[][]
}

interface PictureBlock extends Box {
  href: string
}

interface Slide {
  texts: TextBlock[]
  pictures: PictureBlock[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseXml(text: string): Document {
  const document = new DOMParser().parseFromString(text, 'application/xml')
  if (document.querySelector('parsererror')) throw new Error('This .pptx file is damaged.')
  return document
}

/** Placeholder keys, most specific first, used to inherit a layout position. */
function placeholderKeys(shape: Element): string[] {
  const ph = shape.getElementsByTagName('p:ph')[0]
  if (!ph) return []
  const type = ph.getAttribute('type') ?? 'body'
  const idx = ph.getAttribute('idx')
  return idx ? [`${type}#${idx}`, `#${idx}`, type] : [`${type}#`, type]
}

function boxOf(shape: Element): Box | null {
  const offset = shape.getElementsByTagName('a:off')[0]
  const extent = shape.getElementsByTagName('a:ext')[0]
  if (!offset || !extent) return null
  return {
    x: Number(offset.getAttribute('x') ?? 0) / EMU_PER_PX,
    y: Number(offset.getAttribute('y') ?? 0) / EMU_PER_PX,
    width: Number(extent.getAttribute('cx') ?? 0) / EMU_PER_PX,
    height: Number(extent.getAttribute('cy') ?? 0) / EMU_PER_PX,
  }
}

/** Sizes a placeholder's text when the slide itself specifies none. */
function defaultSize(shape: Element): number {
  const type = shape.getElementsByTagName('p:ph')[0]?.getAttribute('type')
  if (type === 'title' || type === 'ctrTitle') return 40
  if (type === 'subTitle') return 22
  return 18
}

function runsOf(paragraph: Element, fallbackSize: number): TextRun[] {
  const runs: TextRun[] = []

  for (const node of Array.from(paragraph.getElementsByTagName('a:r'))) {
    const text = node.getElementsByTagName('a:t')[0]?.textContent ?? ''
    if (!text) continue
    const properties = node.getElementsByTagName('a:rPr')[0]
    const color = properties?.getElementsByTagName('a:srgbClr')[0]?.getAttribute('val')
    const size = properties?.getAttribute('sz')
    runs.push({
      text,
      // PowerPoint stores font sizes in hundredths of a point.
      size: size ? Number(size) / 100 : fallbackSize,
      bold: properties?.getAttribute('b') === '1',
      italic: properties?.getAttribute('i') === '1',
      color: color ? `#${color}` : '#111827',
    })
  }

  if (runs.length === 0 && paragraph.getElementsByTagName('a:br').length > 0) {
    runs.push({ text: '', size: 18, bold: false, italic: false, color: '#111827' })
  }

  return runs
}

async function relationships(zip: JSZip, slidePath: string): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const name = slidePath.replace(/([^/]+)$/, '_rels/$1.rels')
  const file = zip.file(name)
  if (!file) return map

  for (const relation of Array.from(
    parseXml(await file.async('text')).getElementsByTagName('Relationship'),
  )) {
    const id = relation.getAttribute('Id')
    const target = relation.getAttribute('Target')
    if (id && target) map.set(id, target.replace(/^\.\.\//, 'ppt/'))
  }

  return map
}

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
}

async function imageHref(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path)
  const extension = path.split('.').pop()?.toLowerCase() ?? ''
  const type = MIME[extension]
  if (!file || !type) return null
  return `data:${type};base64,${await file.async('base64')}`
}

/**
 * Slide placeholders usually carry no geometry of their own: it is inherited
 * from the slide layout, which in turn inherits from the master.
 */
async function inheritedBoxes(zip: JSZip, slidePath: string): Promise<Map<string, Box>> {
  const boxes = new Map<string, Box>()
  const slideRels = await relationships(zip, slidePath)
  const layoutPath = [...slideRels.values()].find((target) => target.includes('slideLayout'))
  if (!layoutPath) return boxes

  const layoutRels = await relationships(zip, layoutPath)
  const masterPath = [...layoutRels.values()].find((target) => target.includes('slideMaster'))

  for (const path of [masterPath, layoutPath]) {
    const file = path ? zip.file(path) : null
    if (!file) continue
    const document = parseXml(await file.async('text'))
    for (const shape of Array.from(document.getElementsByTagName('p:sp'))) {
      const box = boxOf(shape)
      if (!box) continue
      for (const key of placeholderKeys(shape)) {
        if (!boxes.has(key) || path === layoutPath) boxes.set(key, box)
      }
    }
  }

  return boxes
}

async function readSlide(zip: JSZip, path: string): Promise<Slide> {
  const document = parseXml(await zip.file(path)!.async('text'))
  const rels = await relationships(zip, path)
  const inherited = await inheritedBoxes(zip, path)
  const slide: Slide = { texts: [], pictures: [] }

  for (const shape of Array.from(document.getElementsByTagName('p:sp'))) {
    const body = shape.getElementsByTagName('p:txBody')[0]
    const box =
      boxOf(shape) ??
      placeholderKeys(shape)
        .map((key) => inherited.get(key))
        .find((candidate) => candidate !== undefined) ??
      null
    if (!box || !body) continue

    const paragraphs: TextRun[][] = []
    let align = 'left'
    for (const paragraph of Array.from(body.getElementsByTagName('a:p'))) {
      const properties = paragraph.getElementsByTagName('a:pPr')[0]
      const value = properties?.getAttribute('algn')
      if (value === 'ctr') align = 'center'
      else if (value === 'r') align = 'right'
      paragraphs.push(runsOf(paragraph, defaultSize(shape)))
    }

    if (paragraphs.some((runs) => runs.length > 0)) slide.texts.push({ ...box, align, paragraphs })
  }

  for (const picture of Array.from(document.getElementsByTagName('p:pic'))) {
    const box = boxOf(picture)
    const embed = picture.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed')
    const target = embed ? rels.get(embed) : undefined
    if (!box || !target) continue
    const href = await imageHref(zip, target)
    if (href) slide.pictures.push({ ...box, href })
  }

  return slide
}

function slideToHtml(slide: Slide): string {
  const parts: string[] = []

  for (const picture of slide.pictures) {
    parts.push(
      `<img src="${picture.href}" style="position:absolute;left:${picture.x}px;top:${picture.y}px;width:${picture.width}px;height:${picture.height}px;object-fit:contain" />`,
    )
  }

  for (const block of slide.texts) {
    const paragraphs = block.paragraphs
      .map((runs) => {
        if (runs.length === 0) return '<p style="margin:0">&nbsp;</p>'
        const spans = runs
          .map(
            (run) =>
              `<span style="font-size:${run.size}px;font-weight:${run.bold ? 700 : 400};font-style:${run.italic ? 'italic' : 'normal'};color:${run.color}">${escapeHtml(run.text)}</span>`,
          )
          .join('')
        return `<p style="margin:0 0 0.25em">${spans}</p>`
      })
      .join('')

    parts.push(
      `<div style="position:absolute;left:${block.x}px;top:${block.y}px;width:${block.width}px;height:${block.height}px;text-align:${block.align};overflow:hidden">${paragraphs}</div>`,
    )
  }

  return `<div style="position:relative;width:100%;height:100%;background:#ffffff">${parts.join('')}</div>`
}

/** Slide file names, in the order the presentation lists them. */
async function slideOrder(zip: JSZip): Promise<string[]> {
  const paths = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  const presentation = zip.file('ppt/presentation.xml')
  if (!presentation) return paths.sort()

  const rels = await relationships(zip, 'ppt/presentation.xml')
  const document = parseXml(await presentation.async('text'))
  const ordered: string[] = []

  for (const entry of Array.from(document.getElementsByTagName('p:sldId'))) {
    const target = rels.get(entry.getAttribute('r:id') ?? '')
    if (target && paths.includes(target)) ordered.push(target)
  }

  return ordered.length > 0 ? ordered : paths.sort()
}

async function slideSize(zip: JSZip): Promise<{ width: number; height: number }> {
  const presentation = zip.file('ppt/presentation.xml')
  if (!presentation) return DEFAULT_SLIDE

  const size = parseXml(await presentation.async('text')).getElementsByTagName('p:sldSz')[0]
  if (!size) return DEFAULT_SLIDE
  return {
    width: Number(size.getAttribute('cx') ?? 0) / EMU_PER_PX || DEFAULT_SLIDE.width,
    height: Number(size.getAttribute('cy') ?? 0) / EMU_PER_PX || DEFAULT_SLIDE.height,
  }
}

export interface PptxConversion {
  blob: Blob
  slideCount: number
}

/**
 * Read a .pptx directly: shapes, their positions and their pictures are laid
 * out as absolutely positioned HTML, one page per slide.
 */
export async function pptxToPdf(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<PptxConversion> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const paths = await slideOrder(zip)
  if (paths.length === 0) throw new Error('No slides were found in this presentation.')

  const { width, height } = await slideSize(zip)
  const pages: string[] = []

  for (const [index, path] of paths.entries()) {
    pages.push(slideToHtml(await readSlide(zip, path)))
    onProgress?.((index + 1) / (paths.length * 2))
  }

  const blob = await fixedPagesToPdf(pages, Math.round(width), Math.round(height), (ratio) =>
    onProgress?.(0.5 + ratio / 2),
  )
  return { blob, slideCount: pages.length }
}
