import React, { useState } from 'react';
import { UploadCloud, Stamp, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { watermarkPdf, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const WatermarkPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [colorHex, setColorHex] = useState('#DC2626');
  const [rotationDegrees, setRotationDegrees] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('يرجى اختيار ملف PDF صالح.');
        return;
      }
      setError(null);
      setDownloadReady(null);
      setFile(selected);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    if (!watermarkText.trim()) {
      setError('يرجى كتابة نص العلامة المائية.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const res = await watermarkPdf(file, watermarkText, {
        opacity,
        size: fontSize,
        colorHex,
        rotationDegrees,
      });
      setDownloadReady(res);
    } catch (err: any) {
      setError('حدث خطأ أثناء تطبيق العلامة المائية.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadReady || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadFile(downloadReady, `${baseName}_watermarked.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">إضافة علامة مائية على PDF</h2>
          <p className="text-sm text-neutral-500">أضف ختماً مخصصاً لجميع الصفحات لحماية حقوق الملكية والسرية</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>خصوصية محلية 100%</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF لتطبيق العلامة المائية
          </span>
          <span className="text-xs text-neutral-500">انقر أو اسحب الملف هنا</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setDownloadReady(null);
              }}
              className="text-xs text-neutral-400 hover:text-red-500 underline"
            >
              ملف آخر
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-5 p-5 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                نص العلامة المائية:
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="مثال: سري للغاية / CONFIDENTIAL"
                className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2 mt-2">
                {['CONFIDENTIAL', 'ORIGINAL', 'DRAFT', 'COPY'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWatermarkText(preset)}
                    className="text-[11px] px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                درجة الشفافية: ({Math.round(opacity * 100)}%)
              </label>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                زاوية الدوران: ({rotationDegrees} درجة)
              </label>
              <div className="flex gap-2">
                {[0, 30, 45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotationDegrees(deg)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      rotationDegrees === deg
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                حجم ولون الخط:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 48)}
                  className="w-20 px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5 bg-transparent"
                />
                <span className="text-xs text-neutral-500 font-mono">{colorHex}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {downloadReady ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل الملف مع العلامة المائية</span>
              </button>
            ) : (
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تطبيق الختم...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4" />
                    <span>تطبيق العلامة المائية الآن</span>
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
