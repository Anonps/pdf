import React, { useState } from 'react';
import { UploadCloud, RotateCw, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { rotatePdf, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const RotatePdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
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

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await rotatePdf(file, rotationAngle);
      setDownloadReady(res);
    } catch (err: any) {
      setError('حدث خطأ أثناء تدوير صفحات الملف.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadReady || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadFile(downloadReady, `${baseName}_rotated_${rotationAngle}deg.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">تدوير صفحات PDF</h2>
          <p className="text-sm text-neutral-500">عدّل اتجاه الصفحات الأفقية والمقلوبة فوراً</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>آمن 100%</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF المراد تدوير صفحاته
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

          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
              اختر زاوية التدوير:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { angle: 90, label: '90° (مع عقارب الساعة)' },
                { angle: 180, label: '180° (رأساً على عقب)' },
                { angle: 270, label: '270° (عكس عقارب الساعة)' },
              ].map((opt) => (
                <button
                  key={opt.angle}
                  type="button"
                  onClick={() => setRotationAngle(opt.angle)}
                  className={`p-3 text-center rounded-xl border transition-all ${
                    rotationAngle === opt.angle
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm'
                  }`}
                >
                  <RotateCw
                    className={`w-5 h-5 mx-auto mb-1.5 ${
                      opt.angle === 180 ? 'rotate-180' : opt.angle === 270 ? '-rotate-90' : 'rotate-90'
                    }`}
                  />
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
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
                <span>تنزيل الملف المدور</span>
              </button>
            ) : (
              <button
                onClick={handleRotate}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التدوير...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4" />
                    <span>تدوير وتطبيق الآن</span>
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
