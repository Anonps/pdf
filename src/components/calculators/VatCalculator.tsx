import React, { useState, useMemo } from 'react';
import { Receipt, ArrowLeftRight, FileText } from 'lucide-react';

export const VatCalculator: React.FC = () => {
  const [mode, setMode] = useState<'add' | 'extract'>('add'); // 'add': net to gross, 'extract': gross to net
  const [amount, setAmount] = useState<number>(1000);
  const [vatRate, setVatRate] = useState<number>(15); // Default 15% (Saudi / typical)

  const result = useMemo(() => {
    const val = Math.max(0, amount);
    const rate = Math.max(0, vatRate) / 100;

    if (mode === 'add') {
      const netAmount = val;
      const vatAmount = netAmount * rate;
      const grossAmount = netAmount + vatAmount;
      return { netAmount, vatAmount, grossAmount };
    } else {
      const grossAmount = val;
      const netAmount = grossAmount / (1 + rate);
      const vatAmount = grossAmount - netAmount;
      return { netAmount, vatAmount, grossAmount };
    }
  }, [mode, amount, vatRate]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة ضريبة القيمة المضافة (VAT)</h2>
          <p className="text-sm text-neutral-500">حساب الضريبة المضافة أو استخراجها من المبلغ الإجمالي بدقة محاسبية</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setMode('add')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === 'add'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          إضافة الضريبة (مبلغ غير شامل)
        </button>
        <button
          type="button"
          onClick={() => setMode('extract')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === 'extract'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          استخراج الضريبة (مبلغ شامل الضريبة)
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {mode === 'add' ? 'المبلغ الأساسي (قبل الضريبة):' : 'المبلغ الإجمالي (شاملاً الضريبة):'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <span className="text-xs text-neutral-400 absolute left-3 top-3.5">ريال</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 tabular-nums"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              نسبة الضريبة (%):
            </label>
            <div className="flex gap-2 mb-2">
              {[
                { label: 'السعودية (15%)', rate: 15 },
                { label: 'الإمارات وعمان (5%)', rate: 5 },
                { label: 'البحرين (10%)', rate: 10 },
                { label: 'مصر (14%)', rate: 14 },
              ].map((item) => (
                <button
                  key={item.rate}
                  type="button"
                  onClick={() => setVatRate(item.rate)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    vatRate === item.rate
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">نسبة مخصصة:</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-24 px-3 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs tabular-nums text-neutral-900 dark:text-white"
              />
              <span className="text-xs text-neutral-500">%</span>
            </div>
          </div>
        </div>

        {/* Invoice Simulation Output */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-700/60">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>نموذج الفاتورة الضريبية المبسطة</span>
              </div>
              <span className="text-[11px] text-neutral-400">نسبة الضريبة: {vatRate}%</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>المبلغ الخاضع للضريبة (قبل الضريبة):</span>
                <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                  {result.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>مبلغ ضريبة القيمة المضافة ({vatRate}%):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  + {result.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-base font-bold text-neutral-900 dark:text-white">
                <span>الإجمالي المستحق (شامل الضريبة):</span>
                <span className="text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {result.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60 text-[11px] text-neutral-400 flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>
              {mode === 'add'
                ? `تمت إضافة ${result.vatAmount.toFixed(2)} ريال كضريبة إلى المبلغ الأصلي.`
                : `تم استخراج ${result.vatAmount.toFixed(2)} ريال كضريبة، وصافي القيمة الأصلية هو ${result.netAmount.toFixed(2)} ريال.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
