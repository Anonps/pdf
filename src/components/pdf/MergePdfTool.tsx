import React, { useState } from 'react';
import { UploadCloud, FileText, ArrowUp, ArrowDown, Trash2, Download, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { mergePdfs, downloadFile, formatFileSize } from '../../utils/pdfEngine';

export const MergePdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter((f) => f.type === 'application/pdf');
      if (selected.length === 0) {
        setError('يرجى اختيار ملفات بصيغة PDF فقط.');
        return;
      }
      setError(null);
      setDownloadReady(null);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFiles.length) return prev;
      const temp = newFiles[index];
      newFiles[index] = newFiles[targetIndex];
      newFiles[targetIndex] = temp;
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDownloadReady(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('يرجى اختيار ملفين PDF على الأقل للدمج.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const mergedBytes = await mergePdfs(files);
      setDownloadReady(mergedBytes);
    } catch (err) {
      setError('حدث خطأ أثناء دمج الملفات. يرجى التأكد من أن الملفات غير تالفة أو محمية بكلمة مرور.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadReady) return;
    downloadFile(downloadReady, `merged_${Date.now()}.pdf`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">دمج ملفات PDF</h2>
          <p className="text-sm text-neutral-500">اختر الملفات، رتبها حسب الرغبة، ثم ادمجها في ثوانٍ</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>أمان 100% (معالجة بالمتصفح)</span>
        </div>
      </div>

      {/* Upload Zone */}
      <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
        <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          انقر لاختيار ملفات PDF أو اسحبها هنا
        </span>
        <span className="text-xs text-neutral-500">يمكنك إضافة عدة ملفات دفعة واحدة</span>
        <input
          type="file"
          accept=".pdf,application/pdf"
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

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>الملفات المختارة ({files.length}):</span>
            <span>استخدم الأسهم لتغيير الترتيب</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold w-5 text-neutral-400 text-center">
                    {idx + 1}
                  </span>
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveFile(idx, 'up')}
                    disabled={idx === 0}
                    title="تحريك لأعلى"
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, 'down')}
                    disabled={idx === files.length - 1}
                    title="تحريك لأسفل"
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    title="حذف"
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => {
                setFiles([]);
                setDownloadReady(null);
              }}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              إلغاء وتفريغ القائمة
            </button>

            <div className="flex items-center gap-3">
              {downloadReady ? (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الملف المدمج الآن</span>
                </button>
              ) : (
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-40 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الدمج محلياً...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>دمج {files.length} ملفات الآن</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
