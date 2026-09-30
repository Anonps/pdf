import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRightLeft } from 'lucide-react';

export const ProfitMarginCalculator: React.FC = () => {
  const [costPrice, setCostPrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(140);

  const metrics = useMemo(() => {
    const cost = Math.max(0, costPrice);
    const revenue = Math.max(0, sellingPrice);
    const profit = revenue - cost;

    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
    const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      profit,
      marginPercent,
      markupPercent,
    };
  }, [costPrice, sellingPrice]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة هامش الربح والترميز (Margin & Markup)</h2>
          <p className="text-sm text-neutral-500">حساب هامش الربح الإجمالي والفرق الدقيق بينه وبين نسبة الزيادة على التكلفة</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Calculator className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              تكلفة السلعة / الخدمة (Cost Price):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <span className="text-xs text-neutral-400 absolute left-3 top-3.5">ريال</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              سعر البيع المستهدف (Selling Price):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <span className="text-xs text-neutral-400 absolute left-3 top-3.5">ريال</span>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">صافي الربح النقدي للوحدة</div>
            <div className={`text-3xl font-extrabold tabular-nums mb-4 ${metrics.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {metrics.profit.toFixed(2)}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">هامش الربح (Margin)</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  %{metrics.marginPercent.toFixed(1)}
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">من إجمالي سعر البيع</span>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">الترميز (Markup)</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  %{metrics.markupPercent.toFixed(1)}
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">زيادة فوق التكلفة</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-500 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              قاعدة ذهبية: هامش الربح دائماً أقل من نسبة الترميز لنفس المنتج لأن الأول يُقاس على السعر الأكبر.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
