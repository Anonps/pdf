import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Type,
  Eraser,
  Highlighter,
  Calendar,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Loader2,
  Sparkles,
  Move,
  Check,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { downloadFile, formatFileSize } from '../../utils/pdfEngine';

// Configure pdfjs worker safely
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface AnnotationItem {
  id: string;
  type: 'text' | 'whiteout' | 'highlight';
  xPercent: number; // 0 to 100 relative to page width
  yPercent: number; // 0 to 100 relative to page height
  widthPercent?: number; // for whiteout/highlight
  heightPercent?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  isBold?: boolean;
}

export const EditPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);

  // Annotations stored per page: { [pageNum: number]: AnnotationItem[] }
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, AnnotationItem[]>>({});
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Dragging state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load PDF file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('يرجى اختيار ملف PDF صالح.');
        return;
      }
      setError(null);
      setFile(selected);
      setPageAnnotations({});
      setSelectedAnnotationId(null);
      setCurrentPage(1);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
      } catch (err: any) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل ملف الـ PDF. قد يكون الملف محمياً بكلمة مرور.');
      }
    }
  };

  // Render current page onto canvas
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
      } catch (err) {
        console.error('Page render error:', err);
      } finally {
        if (!isCancelled) setIsRenderingPage(false);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // Current page annotations
  const currentAnnotations = pageAnnotations[currentPage] || [];

  const updateCurrentAnnotations = (newItems: AnnotationItem[]) => {
    setPageAnnotations((prev) => ({
      ...prev,
      [currentPage]: newItems,
    }));
  };

  // Add Arabic text box
  const handleAddText = () => {
    const newItem: AnnotationItem = {
      id: `text_${Date.now()}`,
      type: 'text',
      xPercent: 30,
      yPercent: 30,
      text: 'نص عربي جديد',
      fontSize: 16,
      color: '#111827',
      bgColor: 'transparent',
      isBold: false,
    };
    updateCurrentAnnotations([...currentAnnotations, newItem]);
    setSelectedAnnotationId(newItem.id);
  };

  // Add Whiteout (Eraser) box to cover existing text
  const handleAddWhiteout = () => {
    const newItem: AnnotationItem = {
      id: `whiteout_${Date.now()}`,
      type: 'whiteout',
      xPercent: 30,
      yPercent: 30,
      widthPercent: 25,
      heightPercent: 4,
      color: '#FFFFFF',
    };
    updateCurrentAnnotations([...currentAnnotations, newItem]);
    setSelectedAnnotationId(newItem.id);
  };

  // Add Highlight marker
  const handleAddHighlight = () => {
    const newItem: AnnotationItem = {
      id: `highlight_${Date.now()}`,
      type: 'highlight',
      xPercent: 30,
      yPercent: 30,
      widthPercent: 25,
      heightPercent: 3,
      color: '#FEF08A', // soft yellow
    };
    updateCurrentAnnotations([...currentAnnotations, newItem]);
    setSelectedAnnotationId(newItem.id);
  };

  // Add Date stamp
  const handleAddDate = () => {
    const today = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const newItem: AnnotationItem = {
      id: `date_${Date.now()}`,
      type: 'text',
      xPercent: 30,
      yPercent: 15,
      text: today,
      fontSize: 14,
      color: '#1F2937',
      isBold: true,
    };
    updateCurrentAnnotations([...currentAnnotations, newItem]);
    setSelectedAnnotationId(newItem.id);
  };

  // Remove active item
  const handleDeleteSelected = () => {
    if (!selectedAnnotationId) return;
    updateCurrentAnnotations(currentAnnotations.filter((a) => a.id !== selectedAnnotationId));
    setSelectedAnnotationId(null);
  };

  // Update selected item properties
  const updateSelected = (props: Partial<AnnotationItem>) => {
    if (!selectedAnnotationId) return;
    updateCurrentAnnotations(
      currentAnnotations.map((item) => {
        if (item.id === selectedAnnotationId) {
          return { ...item, ...props };
        }
        return item;
      })
    );
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
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

    const newX = Math.max(0, Math.min(95, mouseXPercent - dragOffset.x));
    const newY = Math.max(0, Math.min(95, mouseYPercent - dragOffset.y));

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

  // Export modified PDF
  const handleExportPdf = async () => {
    if (!file) return;
    setIsExporting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfLibDoc.getPages();

      // Check pages that have annotations
      const modifiedPageNums = Object.keys(pageAnnotations)
        .map(Number)
        .filter((num) => pageAnnotations[num] && pageAnnotations[num].length > 0);

      if (modifiedPageNums.length === 0) {
        setError('لم تقم بإضافة أي نصوص أو تعديلات بعد.');
        setIsExporting(false);
        return;
      }

      for (const pageNum of modifiedPageNums) {
        const pageIdx = pageNum - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const targetPage = pages[pageIdx];
        const { width: pWidth, height: pHeight } = targetPage.getSize();
        const annotations = pageAnnotations[pageNum];

        // Create high-res offscreen overlay canvas (scale = 2.0 for crisp retina printing)
        const scale = 2.0;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = pWidth * scale;
        offscreenCanvas.height = pHeight * scale;
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) continue;

        // Render annotations onto offscreen canvas
        for (const item of annotations) {
          const itemX = (item.xPercent / 100) * offscreenCanvas.width;
          const itemY = (item.yPercent / 100) * offscreenCanvas.height;

          if (item.type === 'whiteout') {
            const w = ((item.widthPercent || 20) / 100) * offscreenCanvas.width;
            const h = ((item.heightPercent || 4) / 100) * offscreenCanvas.height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(itemX, itemY, w, h);
          } else if (item.type === 'highlight') {
            const w = ((item.widthPercent || 20) / 100) * offscreenCanvas.width;
            const h = ((item.heightPercent || 4) / 100) * offscreenCanvas.height;
            ctx.fillStyle = item.color || '#FEF08A';
            ctx.globalAlpha = 0.45;
            ctx.fillRect(itemX, itemY, w, h);
            ctx.globalAlpha = 1.0;
          } else if (item.type === 'text' && item.text) {
            const fontSizePx = (item.fontSize || 16) * scale;
            ctx.font = `${item.isBold ? 'bold ' : ''}${fontSizePx}px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif`;
            ctx.direction = 'rtl';
            ctx.textBaseline = 'top';

            if (item.bgColor && item.bgColor !== 'transparent') {
              const textMetrics = ctx.measureText(item.text);
              const padding = 4 * scale;
              ctx.fillStyle = item.bgColor;
              ctx.fillRect(
                itemX - textMetrics.width - padding,
                itemY,
                textMetrics.width + padding * 2,
                fontSizePx + padding * 2
              );
            }

            ctx.fillStyle = item.color || '#111827';
            ctx.fillText(item.text, itemX, itemY);
          }
        }

        // Embed the overlay PNG onto the original PDF page
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
      downloadFile(modifiedPdfBytes, `${baseName}_edited.pdf`);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ وتصدير ملف الـ PDF المعدل.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedItem = currentAnnotations.find((a) => a.id === selectedAnnotationId);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">تحرير وتعديل نصوص PDF</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
              دعم كامل للعربية
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            أضف نصوصاً عربية متصلة ومضبوطة، وامسح الأخطاء بميزة التبييض (Whiteout)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>معالجة آمنة محلياً 100%</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-12 h-12 text-neutral-400 mb-3" />
          <span className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF المراد تحريره وإضافة نصوص عربية إليه
          </span>
          <span className="text-xs text-neutral-500">انقر هنا أو اسحب الملف لفتح المحرر التفاعلي</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Main Top Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ أضف نص عربي</span>
              </button>

              <button
                type="button"
                onClick={handleAddWhiteout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="تغطية أو مسح نص قديم برقعة بيضاء نظيفة"
              >
                <Eraser className="w-3.5 h-3.5 text-blue-500" />
                <span>تبييض ومسح (Whiteout)</span>
              </button>

              <button
                type="button"
                onClick={handleAddHighlight}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="إضافة تظليل ملون فوق النصوص"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                <span>تظليل (Highlight)</span>
              </button>

              <button
                type="button"
                onClick={handleAddDate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>تاريخ اليوم</span>
              </button>
            </div>

            {/* Navigation & Zoom controls */}
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
                  onClick={() => setZoomScale((z) => Math.min(2.0, Number((z + 0.2).toFixed(1))))}
                  className="p-1 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Item Editing Sub-Bar (When an item is selected) */}
          {selectedItem && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                {selectedItem.type === 'text' && (
                  <>
                    <input
                      type="text"
                      value={selectedItem.text || ''}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      placeholder="اكتب النص العربي هنا..."
                      dir="rtl"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />

                    {/* Font Size */}
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-500 text-[11px]">الحجم:</span>
                      <input
                        type="number"
                        min="10"
                        max="60"
                        value={selectedItem.fontSize || 16}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-14 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-center"
                      />
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center gap-1.5">
                      {['#111827', '#DC2626', '#059669', '#2563EB'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => updateSelected({ color: col })}
                          style={{ backgroundColor: col }}
                          className={`w-5 h-5 rounded-full border ${
                            selectedItem.color === col ? 'ring-2 ring-emerald-500 ring-offset-1' : 'border-neutral-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Bold toggle */}
                    <button
                      type="button"
                      onClick={() => updateSelected({ isBold: !selectedItem.isBold })}
                      className={`px-2 py-1 font-bold rounded border ${
                        selectedItem.isBold
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      B
                    </button>
                  </>
                )}

                {(selectedItem.type === 'whiteout' || selectedItem.type === 'highlight') && (
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {selectedItem.type === 'whiteout' ? 'مربع التبييض (مسح النص)' : 'مربع التظليل'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">العرض:</span>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={selectedItem.widthPercent || 20}
                        onChange={(e) => updateSelected({ widthPercent: Number(e.target.value) })}
                        className="w-24 accent-emerald-600"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">الارتفاع:</span>
                      <input
                        type="range"
                        min="2"
                        max="25"
                        value={selectedItem.heightPercent || 4}
                        onChange={(e) => updateSelected({ heightPercent: Number(e.target.value) })}
                        className="w-20 accent-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">يمكنك سحبه بالفأرة لأي مكان</span>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف العنصر</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Document Viewport */}
          <div
            className="relative overflow-auto max-h-[680px] p-4 bg-neutral-200/60 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl flex items-center justify-center select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {isRenderingPage && (
              <div className="absolute inset-0 z-30 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-2xs flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>جاري رسم الصفحة...</span>
                </div>
              </div>
            )}

            <div
              ref={containerRef}
              className="relative shadow-2xl bg-white border border-neutral-300 dark:border-neutral-700 transition-all inline-block"
              style={{ lineHeight: 0 }}
              onClick={() => setSelectedAnnotationId(null)}
            >
              {/* PDF Canvas Base */}
              <canvas ref={canvasRef} className="block max-w-none" />

              {/* Interactive Annotations Overlay */}
              {currentAnnotations.map((item) => {
                const isSelected = item.id === selectedAnnotationId;

                if (item.type === 'whiteout') {
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      style={{
                        position: 'absolute',
                        left: `${item.xPercent}%`,
                        top: `${item.yPercent}%`,
                        width: `${item.widthPercent || 20}%`,
                        height: `${item.heightPercent || 4}%`,
                        backgroundColor: '#FFFFFF',
                        border: isSelected ? '2px dashed #059669' : '1px solid #E5E7EB',
                        cursor: 'move',
                        zIndex: 10,
                      }}
                      className="group flex items-center justify-between px-1"
                    >
                      <span className="text-[10px] text-neutral-400 font-mono select-none">
                        تبييض
                      </span>
                      <Move className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100" />
                    </div>
                  );
                }

                if (item.type === 'highlight') {
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      style={{
                        position: 'absolute',
                        left: `${item.xPercent}%`,
                        top: `${item.yPercent}%`,
                        width: `${item.widthPercent || 20}%`,
                        height: `${item.heightPercent || 3}%`,
                        backgroundColor: item.color || '#FEF08A',
                        opacity: 0.5,
                        border: isSelected ? '2px dashed #059669' : 'none',
                        cursor: 'move',
                        zIndex: 9,
                      }}
                    />
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
                      backgroundColor: item.bgColor && item.bgColor !== 'transparent' ? item.bgColor : undefined,
                      cursor: 'move',
                      zIndex: 20,
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                    className={`px-1.5 py-0.5 rounded leading-normal transition-shadow font-sans ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'hover:outline-dashed hover:outline-1 hover:outline-neutral-400'
                    }`}
                  >
                    <span>{item.text || 'نص'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Bottom Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>الملف الحالي: <strong>{file.name}</strong> ({formatFileSize(file.size)})</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPdfDoc(null);
                  setPageAnnotations({});
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
                    <span>جاري حفظ التعديلات محلياً...</span>
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
