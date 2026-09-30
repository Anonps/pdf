import React, { useState } from 'react';
import { UploadCloud, FileText, Download, Scissors, ShieldCheck, Loader2 } from 'lucide-react';
import { splitPdf, inspectPdf, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const SplitPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ data: Uint8Array; extractedCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('يرجى اختيار ملف PDF صالح.');
        return;
      }
      setError(null);
      setDownloadReady(null);
      setFile(selected);
      try {
        const info = await inspectPdf(selected);
        setTotalPages(info.pageCount);
        setPageRange(`1-${Math.min(info.pageCount, 2)}`);
      } catch (err) {
        console.error(err);
        setError('تعذر قراءة صفحات الملف. قد يكون محمياً بكلمة مرور.');
      }
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await splitPdf(file, pageRange);
      setDownloadReady(res);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء استخراج الصفحات.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadReady || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadFile(downloadReady.data, `${baseName}_extracted.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">تقسيم واستخراج صفحات PDF</h2>
          <p className="text-sm text-neutral-500">حدد أرقام الصفحات المطلوبة واستخرجها في ملف جديد ونظيف</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>خصوصية تامة</span>
        </div>
      </div>

      {!file ? (
        <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
          <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            اختر ملف PDF المراد استخراج صفحات منه
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
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span>الحجم: {formatFileSize(file.size)}</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    عدد الصفحات الكلي: {totalPages}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setDownloadReady(null);
              }}
              className="text-xs text-neutral-400 hover:text-red-500 underline"
            >
              تغيير الملف
            </button>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/30 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              الصفحات المطلوب استخراجها:
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="مثال: 1, 3-5, 8"
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-neutral-500 mt-2">
              صيغة الاختيار: اكتب أرقام مفصولة بفواصل للصفحات الفردية أو استخدم علامة (-) للنطاق، مثلاً:
              <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300 mr-1">
                1-3, 5, 7
              </span>
            </p>
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
                <span>تنزيل الملف المستخرج ({downloadReady.extractedCount} صفحات)</span>
              </button>
            ) : (
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الاستخراج...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>استخراج الصفحات الآن</span>
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
