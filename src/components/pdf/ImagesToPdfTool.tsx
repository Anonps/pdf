import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Trash2, ArrowUp, ArrowDown, ShieldCheck, Loader2 } from 'lucide-react';
import { imagesToPdf, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const ImagesToPdfTool: React.FC = () => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [marginMm, setMarginMm] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      if (selected.length === 0) {
        setError('يرجى اختيار صور صالحة (PNG, JPG, WebP).');
        return;
      }
      setError(null);
      setDownloadReady(null);
      const newItems = selected.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newItems]);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const list = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return list;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setDownloadReady(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('يرجى اختيار صورة واحدة على الأقل.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const filesOnly = images.map((item) => item.file);
      const res = await imagesToPdf(filesOnly, orientation, marginMm);
      setDownloadReady(res);
    } catch (err: any) {
      setError('حدث خطأ أثناء تحويل الصور إلى PDF.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadReady) return;
    downloadFile(downloadReady, `images_${Date.now()}.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">تحويل الصور إلى PDF</h2>
          <p className="text-sm text-neutral-500">اجمع لقطات الشاشة والصور في مستند PDF منسق وجاهز للمشاركة</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>توليد محلي فوري</span>
        </div>
      </div>

      <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
        <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          انقر لاختيار الصور (JPG, PNG, WebP)
        </span>
        <span className="text-xs text-neutral-500">يمكنك رفع صور متعددة دفعة واحدة</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Settings Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                اتجاه الصفحة:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('p')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    orientation === 'p'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  عمودي (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('l')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    orientation === 'l'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  أفقي (Landscape)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                الهامش: ({marginMm} مم)
              </span>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={marginMm}
                onChange={(e) => setMarginMm(parseInt(e.target.value, 10))}
                className="w-24 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((item, idx) => (
              <div
                key={idx}
                className="relative group border border-neutral-200 dark:border-neutral-700/80 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center">
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 bg-white dark:bg-neutral-800 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[90px] text-neutral-600 dark:text-neutral-300 font-medium">
                    {idx + 1}. {item.file.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      title="تقديم"
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      title="تأخير"
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      title="حذف"
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-neutral-500">
              إجمالي الصور: {images.length} صورة
            </span>

            {downloadReady ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف الـ PDF الناتج</span>
              </button>
            ) : (
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري توليد ملف الـ PDF...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>تحويل الصور إلى PDF الآن</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
