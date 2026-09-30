import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Type,
  Eraser,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Loader2,
  Move,
  AlignRight,
  AlignCenter,
  AlignLeft,
  ScanText,
  Eye,
  EyeOff,
  Sparkles,
  Bold,
  Palette,
  Layers,
  Copy,
  FolderUp,
  Check,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { downloadFile, formatFileSize } from '../../utils/pdfEngine';

// Ensure pdfjs worker is configured
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface UploadedFont {
  id: string;
  name: string;
  fileName: string;
  bytes: Uint8Array;
}

export interface DetectedTextSpan {
  id: string;
  text: string;
  xPercent: number; // 0 to 100 relative to page width
  yPercent: number; // 0 to 100 relative to page height
  widthPercent: number;
  heightPercent: number;
  fontSize: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text' | 'whiteout';
  xPercent: number;
  yPercent: number;
  widthPercent?: number; // for whiteout or auto bounding box
  heightPercent?: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isBold?: boolean;
  align?: 'right' | 'center' | 'left';
  hasWhiteoutUnderlay?: boolean;
  whiteoutPadding?: number;
}

export const EditPdfTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.25);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);

  // Detected text blocks from PDF
  const [detectedTexts, setDetectedTexts] = useState<Record<number, DetectedTextSpan[]>>({});
  const [showDetectedHighlights, setShowDetectedHighlights] = useState<boolean>(true);

  // User annotations per page: { [pageNum: number]: TextAnnotation[] }
  const [annotations, setAnnotations] = useState<Record<number, TextAnnotation[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dragging state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Uploaded TTF / OTF Fonts State
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([]);
  const [activeFontFamily, setActiveFontFamily] = useState<string>('IBM Plex Sans Arabic');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fontInputRef = useRef<HTMLInputElement | null>(null);

  // Handle uploading custom .ttf or .otf Arabic fonts
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fontFile = e.target.files[0];
      const isFont =
        fontFile.name.toLowerCase().endsWith('.ttf') ||
        fontFile.name.toLowerCase().endsWith('.otf') ||
        fontFile.type.includes('font') ||
        fontFile.type.includes('ttf') ||
        fontFile.type.includes('otf');

      if (!isFont) {
        setError('يرجى اختيار ملف خط سليم بصيغة TrueType (.ttf) أو OpenType (.otf).');
        return;
      }

      try {
        const arrayBuffer = await fontFile.arrayBuffer();
        const fontBytes = new Uint8Array(arrayBuffer);

        // Generate clean CSS font family identifier
        const cleanName = fontFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
        const familyName = `CustomFont_${cleanName}_${Date.now()}`;

        // Register font in the browser DOM via FontFace API
        const fontFace = new FontFace(familyName, arrayBuffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        const newFont: UploadedFont = {
          id: `font_${Date.now()}`,
          name: familyName,
          fileName: fontFile.name,
          bytes: fontBytes,
        };

        setUploadedFonts((prev) => [...prev, newFont]);
        setActiveFontFamily(familyName);

        // Immediately apply to selected annotation if present
        if (selectedId) {
          updateSelected({ fontFamily: familyName });
        }

        setSuccessMsg(`تم رفع وتفعيل الخط العربي (${fontFile.name}) بنجاح! أصبح جاهزاً للاستخدام والتصدير.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setError(null);
      } catch (err: any) {
        console.error('Error loading custom font:', err);
        setError('تعذر تحميل ملف الخط. يرجى التأكد من أن الملف سليم بصيغة .ttf أو .otf.');
      }

      // Reset input value so same file can be re-selected if desired
      if (e.target) e.target.value = '';
    }
  };

  // Load PDF file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('يرجى اختيار ملف PDF صالح.');
        return;
      }
      setError(null);
      setSuccessMsg(null);
      setFile(selected);
      setAnnotations({});
      setDetectedTexts({});
      setSelectedId(null);
      setCurrentPage(1);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
      } catch (err: any) {
        console.error(err);
        setError('تعذر تحميل ملف الـ PDF. قد يكون الملف محمياً بكلمة مرور أو مشفراً.');
      }
    }
  };

  // Render current page onto canvas and detect text items
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;
      setIsRenderingPage(true);

      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoomScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // If texts not detected for this page yet, extract them
        if (!detectedTexts[currentPage]) {
          setIsExtractingText(true);
          const textContent = await page.getTextContent();
          const pWidth = viewport.width / zoomScale;
          const pHeight = viewport.height / zoomScale;

          const spans: DetectedTextSpan[] = [];
          textContent.items.forEach((item: any, idx: number) => {
            if (!item.str || !item.str.trim()) return;

            // item.transform: [scaleX, skewY, skewX, scaleY, tx, ty]
            const tx = item.transform[4];
            const ty = item.transform[5];
            const fontSize = Math.hypot(item.transform[0], item.transform[1]) || 12;

            // In PDF coords, (0,0) is bottom-left, canvas is top-left
            const x = tx;
            const y = pHeight - ty - fontSize;
            const width = item.width || fontSize * (item.str.length * 0.55);
            const height = item.height || fontSize * 1.2;

            const xPercent = Math.max(0, Math.min(100, (x / pWidth) * 100));
            const yPercent = Math.max(0, Math.min(100, (y / pHeight) * 100));
            const widthPercent = Math.max(1, Math.min(100, (width / pWidth) * 100));
            const heightPercent = Math.max(1, Math.min(20, (height / pHeight) * 100));

            spans.push({
              id: `detected_${currentPage}_${idx}`,
              text: item.str,
              xPercent,
              yPercent,
              widthPercent,
              heightPercent,
              fontSize: Math.round(fontSize),
            });
          });

          if (!isCancelled) {
            setDetectedTexts((prev) => ({
              ...prev,
              [currentPage]: spans,
            }));
          }
        }
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (!isCancelled) {
          setIsRenderingPage(false);
          setIsExtractingText(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // Current page user annotations
  const currentAnnotations = annotations[currentPage] || [];
  const currentDetected = detectedTexts[currentPage] || [];

  const updateCurrentAnnotations = (newItems: TextAnnotation[]) => {
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: newItems,
    }));
  };

  // Convert a detected text block into an editable Arabic text with automatic whiteout
  const handleSelectDetectedText = (span: DetectedTextSpan) => {
    // Check if already replaced
    const existing = currentAnnotations.find(
      (a) => Math.abs(a.xPercent - span.xPercent) < 2 && Math.abs(a.yPercent - span.yPercent) < 2
    );

    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    const newAnnotation: TextAnnotation = {
      id: `text_${Date.now()}`,
      type: 'text',
      xPercent: span.xPercent,
      yPercent: span.yPercent,
      widthPercent: span.widthPercent + 2,
      heightPercent: span.heightPercent + 1,
      text: span.text,
      fontSize: Math.max(12, span.fontSize),
      fontFamily: 'IBM Plex Sans Arabic',
      color: '#111827',
      isBold: false,
      align: 'right',
      hasWhiteoutUnderlay: true,
      whiteoutPadding: 4,
    };

    updateCurrentAnnotations([...currentAnnotations, newAnnotation]);
    setSelectedId(newAnnotation.id);
    setSuccessMsg(`تم تحديد النص "${span.text.slice(0, 20)}" وتجهيزه للتعديل مع التبييض التلقائي.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Add brand new Arabic text box
  const handleAddNewArabicText = () => {
    const newAnnotation: TextAnnotation = {
      id: `text_${Date.now()}`,
      type: 'text',
      xPercent: 35,
      yPercent: 35,
      text: 'نص عربي جديد',
      fontSize: 18,
      fontFamily: activeFontFamily || 'IBM Plex Sans Arabic',
      color: '#111827',
      isBold: false,
      align: 'right',
      hasWhiteoutUnderlay: false,
      whiteoutPadding: 4,
    };
    updateCurrentAnnotations([...currentAnnotations, newAnnotation]);
    setSelectedId(newAnnotation.id);
  };

  // Add whiteout eraser box to wipe clean any background area
  const handleAddWhiteout = () => {
    const newAnnotation: TextAnnotation = {
      id: `whiteout_${Date.now()}`,
      type: 'whiteout',
      xPercent: 30,
      yPercent: 30,
      widthPercent: 30,
      heightPercent: 4.5,
    };
    updateCurrentAnnotations([...currentAnnotations, newAnnotation]);
    setSelectedId(newAnnotation.id);
  };

  // Delete active item
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    updateCurrentAnnotations(currentAnnotations.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  };

  // Duplicate active item
  const handleDuplicateSelected = () => {
    const item = currentAnnotations.find((a) => a.id === selectedId);
    if (!item) return;

    const copyItem: TextAnnotation = {
      ...item,
      id: `text_${Date.now()}`,
      xPercent: Math.min(90, item.xPercent + 3),
      yPercent: Math.min(90, item.yPercent + 3),
    };
    updateCurrentAnnotations([...currentAnnotations, copyItem]);
    setSelectedId(copyItem.id);
  };

  // Update selected item attributes
  const updateSelected = (props: Partial<TextAnnotation>) => {
    if (!selectedId) return;
    updateCurrentAnnotations(
      currentAnnotations.map((item) => {
        if (item.id === selectedId) {
          return { ...item, ...props };
        }
        return item;
      })
    );
  };

  // Mouse Dragging logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggedId(id);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const item = currentAnnotations.find((a) => a.id === id);
    if (!item) return;

    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: clickXPercent - item.xPercent,
      y: clickYPercent - item.yPercent,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(0, Math.min(96, mouseXPercent - dragOffset.x));
    const newY = Math.max(0, Math.min(96, mouseYPercent - dragOffset.y));

    updateCurrentAnnotations(
      currentAnnotations.map((item) => {
        if (item.id === draggedId) {
          return { ...item, xPercent: newX, yPercent: newY };
        }
        return item;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggedId(null);
  };

  // Export modified PDF using pdf-lib
  const handleExportPdf = async () => {
    if (!file) return;
    setIsExporting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Register fontkit to support custom font embedding in pdf-lib
      pdfLibDoc.registerFontkit(fontkit);

      // Embed any uploaded TTF/OTF fonts in pdf-lib
      for (const customFont of uploadedFonts) {
        try {
          await pdfLibDoc.embedFont(customFont.bytes);
        } catch (fontErr) {
          console.warn(`Font embedding note for ${customFont.fileName}:`, fontErr);
        }
      }

      const pages = pdfLibDoc.getPages();

      // Collect all pages with user annotations
      const modifiedPages = Object.keys(annotations)
        .map(Number)
        .filter((p) => annotations[p] && annotations[p].length > 0);

      if (modifiedPages.length === 0) {
        setError('يرجى تعديل أو إضافة نص واحد على الأقل قبل التصدير.');
        setIsExporting(false);
        return;
      }

      for (const pageNum of modifiedPages) {
        const pageIdx = pageNum - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const targetPage = pages[pageIdx];
        const { width: pWidth, height: pHeight } = targetPage.getSize();
        const pageItems = annotations[pageNum];

        // High resolution offscreen canvas (2.5x for sharp vector print)
        const scale = 2.5;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = pWidth * scale;
        offscreenCanvas.height = pHeight * scale;
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) continue;

        // Render each annotation
        for (const item of pageItems) {
          const itemX = (item.xPercent / 100) * offscreenCanvas.width;
          const itemY = (item.yPercent / 100) * offscreenCanvas.height;

          // Pure whiteout box
          if (item.type === 'whiteout') {
            const w = ((item.widthPercent || 25) / 100) * offscreenCanvas.width;
            const h = ((item.heightPercent || 4) / 100) * offscreenCanvas.height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(itemX, itemY, w, h);
          } else if (item.type === 'text' && item.text) {
            const fontSizePx = (item.fontSize || 16) * scale;
            const fontFamily = item.fontFamily || activeFontFamily || 'IBM Plex Sans Arabic';
            ctx.font = `${item.isBold ? 'bold ' : ''}${fontSizePx}px "${fontFamily}", "IBM Plex Sans Arabic", "Cairo", sans-serif`;
            ctx.direction = 'rtl';
            ctx.textBaseline = 'top';

            const textMetrics = ctx.measureText(item.text);
            const textWidth = textMetrics.width;
            const textHeight = fontSizePx * 1.25;

            // Draw whiteout underlay if enabled
            if (item.hasWhiteoutUnderlay) {
              const padding = (item.whiteoutPadding || 4) * scale;
              ctx.fillStyle = '#FFFFFF';
              const underlayWidth = Math.max(
                textWidth + padding * 2,
                ((item.widthPercent || 0) / 100) * offscreenCanvas.width
              );
              const underlayHeight = Math.max(
                textHeight + padding * 2,
                ((item.heightPercent || 0) / 100) * offscreenCanvas.height
              );

              // Anchor whiteout by alignment
              let underlayX = itemX - padding;
              if (item.align === 'left') underlayX = itemX - padding;
              else if (item.align === 'center') underlayX = itemX - underlayWidth / 2;
              else underlayX = itemX - underlayWidth + padding;

              ctx.fillRect(underlayX, itemY - padding * 0.5, underlayWidth, underlayHeight);
            }

            // Draw Text
            ctx.fillStyle = item.color || '#111827';
            ctx.textAlign = item.align || 'right';
            ctx.fillText(item.text, itemX, itemY);
          }
        }

        // Overlay onto the PDF page using pdf-lib
        const pngDataUrl = offscreenCanvas.toDataURL('image/png');
        const embeddedPng = await pdfLibDoc.embedPng(pngDataUrl);

        targetPage.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width: pWidth,
          height: pHeight,
        });
      }

      const modifiedPdfBytes = await pdfLibDoc.save();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      downloadFile(modifiedPdfBytes, `${baseName}_edited_arabic.pdf`);
      setSuccessMsg('تم حفظ وتنزيل ملف PDF المعدل بنجاح وبأعلى جودة طباعة.');
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تصدير ملف PDF المعدل.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedItem = currentAnnotations.find((a) => a.id === selectedId);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              محرر نصوص PDF الذكي (Edit PDF & Arabic Text)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
              دعم RTL ومحاذاة عربية كاملة
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            حدد النصوص الموجودة بالوثيقة لتعديلها مع ميزة التبييض التلقائي، أو أضف نصوصاً عربية متصلة ومضبوطة
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>معالجة محلية 100% عبر pdf-lib</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-12 h-12 text-neutral-400 mb-3" />
          <span className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF لتحديد وتعديل نصوصه
          </span>
          <span className="text-xs text-neutral-500">
            انقر هنا أو اسحب شهادة أو فاتورة أو عقداً لفتحه في المحرر
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Main Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              {/* Hidden font file input */}
              <input
                ref={fontInputRef}
                type="file"
                accept=".ttf,.otf,font/ttf,font/otf"
                onChange={handleFontUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleAddNewArabicText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ أضف نص عربي</span>
              </button>

              <button
                type="button"
                onClick={handleAddWhiteout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="تغطية أو مسح نص قديم أو لوجو أو رقم"
              >
                <Eraser className="w-3.5 h-3.5 text-blue-500" />
                <span>تبييض ومسح (Whiteout)</span>
              </button>

              <button
                type="button"
                onClick={() => fontInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                title="ارفع ملف خط عربي بصيغة .ttf أو .otf لدعم وتنسيق النصوص العربية في الـ PDF"
              >
                <FolderUp className="w-3.5 h-3.5" />
                <span>+ رفع خط عربي (.ttf)</span>
                {uploadedFonts.length > 0 && (
                  <span className="text-[10px] bg-white/25 text-white px-1.5 py-0.2 rounded-full font-bold">
                    {uploadedFonts.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowDetectedHighlights(!showDetectedHighlights)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  showDetectedHighlights
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                }`}
                title="إظهار مربعات تحديد النصوص المكتشفة في المستند للنقر والتعديل المباشر"
              >
                <ScanText className="w-3.5 h-3.5" />
                <span>كشف النصوص ({currentDetected.length})</span>
                {showDetectedHighlights ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            </div>

            {/* Pagination & Zoom Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                  {currentPage} من {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-neutral-200 dark:border-neutral-700 pr-2">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.8, Number((z - 0.2).toFixed(1))))}
                  className="p-1 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] tabular-nums font-mono text-neutral-500">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.2, Number((z + 0.2).toFixed(1))))}
                  className="p-1 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Fonts Indicator */}
          {uploadedFonts.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-800 dark:text-indigo-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <FolderUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>الخطوط العربية المرفوعة (.ttf):</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {uploadedFonts.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-700 text-xs font-medium shadow-2xs"
                    >
                      <span>{f.fileName}</span>
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                مدمجة في قائمة الخطوط ومفعلة للـ PDF
              </span>
            </div>
          )}

          {/* Quick Detected Text Chips Toolbar (Helps user immediately click on parsed certificate titles/names) */}
          {showDetectedHighlights && currentDetected.length > 0 && (
            <div className="p-3 bg-neutral-100/80 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>انقر على أي نص مكتشف في الوثيقة لتعديله فوراً:</span>
                </span>
                <span>{currentDetected.length} سطر متوفر</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentDetected.slice(0, 12).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectDetectedText(item)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    {item.text.length > 25 ? `${item.text.slice(0, 25)}...` : item.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Item Editing Sub-Bar */}
          {selectedItem && (
            <div className="p-4 bg-white dark:bg-neutral-800/90 rounded-xl border-2 border-emerald-500/60 shadow-md space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-100">
                  <Type className="w-4 h-4 text-emerald-600" />
                  <span>
                    {selectedItem.type === 'text' ? 'تعديل وتنسيق النص العربي:' : 'تعديل مربع التبييض (المسح):'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDuplicateSelected}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded border border-neutral-300 dark:border-neutral-600"
                    title="تكرار العنصر"
                  >
                    <Copy className="w-3 h-3" />
                    <span>تكرار</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>

              {selectedItem.type === 'text' ? (
                <div className="space-y-3">
                  {/* Text Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="rtl"
                      value={selectedItem.text || ''}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      placeholder="اكتب أو عدّل النص العربي هنا..."
                      className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-base text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>

                  {/* Formatting Controls Grid */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    {/* RTL Alignment */}
                    <div className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => updateSelected({ align: 'right' })}
                        title="محاذاة لليمين (RTL)"
                        className={`p-1.5 rounded ${
                          (selectedItem.align || 'right') === 'right'
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelected({ align: 'center' })}
                        title="توسيط"
                        className={`p-1.5 rounded ${
                          selectedItem.align === 'center'
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelected({ align: 'left' })}
                        title="محاذاة لليسار"
                        className={`p-1.5 rounded ${
                          selectedItem.align === 'left'
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Font Family Selector including custom uploaded .ttf fonts */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-500">الخط:</span>
                      <select
                        value={selectedItem.fontFamily || activeFontFamily}
                        onChange={(e) => {
                          const chosenFont = e.target.value;
                          setActiveFontFamily(chosenFont);
                          updateSelected({ fontFamily: chosenFont });
                        }}
                        className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white max-w-[170px]"
                      >
                        {uploadedFonts.length > 0 && (
                          <optgroup label="خطوطك المرفوعة (.ttf)">
                            {uploadedFonts.map((f) => (
                              <option key={f.id} value={f.name}>
                                ⭐ {f.fileName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="الخطوط العربية الأساسية">
                          <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic (افتراضي)</option>
                          <option value="Cairo">Cairo (خط القاهرة)</option>
                          <option value="Amiri">Amiri (خط أميري نسخي)</option>
                          <option value="Tahoma">Tahoma (خط تاهوما)</option>
                          <option value="Arial">Arial (عربي قياسي)</option>
                          <option value="Traditional Arabic">Traditional Arabic (عربي تقليدي)</option>
                        </optgroup>
                      </select>
                      <button
                        type="button"
                        onClick={() => fontInputRef.current?.click()}
                        className="p-1 rounded text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="رفع خط .ttf إضافي"
                      >
                        <FolderUp className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Font Size & Bold */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">حجم الخط:</span>
                      <input
                        type="number"
                        min="10"
                        max="72"
                        value={selectedItem.fontSize || 16}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-16 px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-center tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => updateSelected({ isBold: !selectedItem.isBold })}
                        title="خط عريض"
                        className={`p-1.5 rounded-lg border ${
                          selectedItem.isBold
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Color Presets */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">اللون:</span>
                      <div className="flex items-center gap-1.5">
                        {['#111827', '#1E3A8A', '#047857', '#B91C1C', '#B45309'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => updateSelected({ color: col })}
                            style={{ backgroundColor: col }}
                            className={`w-5 h-5 rounded-full border ${
                              selectedItem.color === col
                                ? 'ring-2 ring-emerald-500 ring-offset-1'
                                : 'border-neutral-300 dark:border-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Auto-Whiteout Underlay Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={selectedItem.hasWhiteoutUnderlay ?? true}
                        onChange={(e) => updateSelected({ hasWhiteoutUnderlay: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        تبييض ومسح الخلفية (إخفاء النص القديم)
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                /* Whiteout Resizing Controls */
                <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">عرض رقعة التبييض:</span>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={selectedItem.widthPercent || 30}
                      onChange={(e) => updateSelected({ widthPercent: Number(e.target.value) })}
                      className="w-32 accent-emerald-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">الارتفاع:</span>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={selectedItem.heightPercent || 4.5}
                      onChange={(e) => updateSelected({ heightPercent: Number(e.target.value) })}
                      className="w-24 accent-emerald-600"
                    />
                  </div>
                  <span className="text-neutral-400">
                    يمكنك سحب المربع بالفأرة لتغطية الكلمات أو الأرقام القديمة بدقة
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Document Viewport */}
          <div
            className="relative overflow-auto max-h-[700px] p-4 bg-neutral-200/60 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-2xl flex items-center justify-center select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {isRenderingPage && (
              <div className="absolute inset-0 z-30 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xs flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>جاري رسم وتجهيز الصفحة...</span>
                </div>
              </div>
            )}

            <div
              ref={containerRef}
              className="relative shadow-2xl bg-white border border-neutral-300 dark:border-neutral-700 transition-all inline-block"
              style={{ lineHeight: 0 }}
              onClick={() => setSelectedId(null)}
            >
              {/* PDF Canvas Base */}
              <canvas ref={canvasRef} className="block max-w-none" />

              {/* Detected Text Highlights Layer (Allows one-click editing) */}
              {showDetectedHighlights &&
                currentDetected.map((span) => {
                  const isAlreadyAnnotated = currentAnnotations.some(
                    (a) => Math.abs(a.xPercent - span.xPercent) < 2 && Math.abs(a.yPercent - span.yPercent) < 2
                  );

                  return (
                    <div
                      key={span.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDetectedText(span);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${span.xPercent}%`,
                        top: `${span.yPercent}%`,
                        width: `${span.widthPercent}%`,
                        height: `${span.heightPercent}%`,
                        zIndex: 10,
                      }}
                      title={`انقر لتعديل: "${span.text}"`}
                      className={`cursor-pointer transition-all border rounded-xs ${
                        isAlreadyAnnotated
                          ? 'border-transparent'
                          : 'border-blue-400/40 hover:border-emerald-500 hover:bg-emerald-400/20'
                      }`}
                    />
                  );
                })}

              {/* User Annotations Layer (Text & Whiteout) */}
              {currentAnnotations.map((item) => {
                const isSelected = item.id === selectedId;

                // Whiteout item
                if (item.type === 'whiteout') {
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      style={{
                        position: 'absolute',
                        left: `${item.xPercent}%`,
                        top: `${item.yPercent}%`,
                        width: `${item.widthPercent || 30}%`,
                        height: `${item.heightPercent || 4.5}%`,
                        backgroundColor: '#FFFFFF',
                        border: isSelected ? '2px dashed #059669' : '1px solid #D1D5DB',
                        cursor: 'move',
                        zIndex: 25,
                      }}
                      className="group flex items-center justify-between px-1.5 shadow-2xs"
                    >
                      <span className="text-[10px] text-neutral-400 font-mono select-none">
                        تبييض ومسح
                      </span>
                      <Move className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100" />
                    </div>
                  );
                }

                // Text item
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                    style={{
                      position: 'absolute',
                      left: `${item.xPercent}%`,
                      top: `${item.yPercent}%`,
                      fontSize: `${(item.fontSize || 16) * zoomScale}px`,
                      color: item.color || '#111827',
                      fontWeight: item.isBold ? 'bold' : 'normal',
                      backgroundColor: item.hasWhiteoutUnderlay ? '#FFFFFF' : 'transparent',
                      textAlign: item.align || 'right',
                      fontFamily: item.fontFamily ? `"${item.fontFamily}", "IBM Plex Sans Arabic", "Cairo", sans-serif` : '"IBM Plex Sans Arabic", "Cairo", sans-serif',
                      cursor: 'move',
                      zIndex: 30,
                      direction: 'rtl',
                    }}
                    className={`px-1.5 py-0.5 rounded leading-normal transition-shadow font-sans select-none ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/50 shadow-md'
                        : 'hover:outline-dashed hover:outline-1 hover:outline-neutral-400'
                    }`}
                  >
                    <span>{item.text || 'نص'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback & Notifications */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Bottom Export & Save Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>الملف الحالي: <strong>{file.name}</strong> ({formatFileSize(file.size)})</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPdfDoc(null);
                  setAnnotations({});
                  setDetectedTexts({});
                }}
                className="text-red-500 hover:underline"
              >
                تغيير الملف
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تطبيق التعديلات عبر pdf-lib...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>حفظ وتنزيل PDF المعدل</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
