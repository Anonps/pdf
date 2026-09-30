import React, { useState } from 'react';
import { UploadCloud, FileArchive, Download, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { compressPdf, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const CompressPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<'normal' | 'high'>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    data: Uint8Array;
    originalSize: number;
    newSize: number;
    savedPercent: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('يرجى اختيار ملف PDF صالح.');
        return;
      }
      setError(null);
      setResult(null);
      setFile(selected);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await compressPdf(file, compressLevel);
      setResult(res);
    } catch (err: any) {
      setError('حدث خطأ أثناء ضغط الملف. تأكد من أن الملف غير مشفر بكلمة سر.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadFile(result.data, `${baseName}_compressed.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">ضغط وتحسين ملفات PDF</h2>
          <p className="text-sm text-neutral-500">تقليل حجم الملف وتسهيل مشاركته دون الإضرار بوضوح النصوص</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>لا يتم رفع الملفات لأي خادم</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF المراد ضغطه
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
              <p className="text-xs text-neutral-500 mt-0.5">الحجم الأصلي: {formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs text-neutral-400 hover:text-red-500 underline"
            >
              ملف آخر
            </button>
          </div>

          {/* Compression Level Selection */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCompressLevel('normal')}
              className={`p-4 rounded-xl border text-right transition-all ${
                compressLevel === 'normal'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <span className="block text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                الضغط الموصى به (Balanced)
              </span>
              <span className="block text-xs text-neutral-500">
                تحسين تدفقات البيانات وحذف الكائنات غير المستغلة مع الحفاظ على أعلى جودة
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCompressLevel('high')}
              className={`p-4 rounded-xl border text-right transition-all ${
                compressLevel === 'high'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <span className="block text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                أقصى ضغط ممكن (Maximum)
              </span>
              <span className="block text-xs text-neutral-500">
                تجريد كامل للبيانات الوصفية مع ضغط التدفقات للوصول لأصغر حجم ممكن
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Success Statistics Card */}
          {result && (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold mb-3">
                <Sparkles className="w-5 h-5" />
                <span>اكتملت عملية الضغط بنجاح!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <div className="text-xs text-neutral-400">الحجم السابق</div>
                  <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {formatFileSize(result.originalSize)}
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <div className="text-xs text-neutral-400">الحجم الجديد</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatFileSize(result.newSize)}
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <div className="text-xs text-neutral-400">نسبة التوفير</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {result.savedPercent}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {result ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف PDF المضغوط</span>
              </button>
            ) : (
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الضغط بالمتصفح...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" />
                    <span>بدء الضغط والتحسين</span>
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
