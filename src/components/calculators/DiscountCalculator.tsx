import React, { useState, useMemo } from 'react';
import { Tag, Sparkles } from 'lucide-react';

export const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(350);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [extraCouponPercent, setExtraCouponPercent] = useState<number>(0);

  const result = useMemo(() => {
    const original = Math.max(0, originalPrice);
    const d1 = Math.max(0, Math.min(100, discountPercent)) / 100;
    const d2 = Math.max(0, Math.min(100, extraCouponPercent)) / 100;

    const afterFirstDiscount = original * (1 - d1);
    const finalPrice = afterFirstDiscount * (1 - d2);
    const totalSavings = original - finalPrice;
    const effectiveDiscountRate = original > 0 ? (totalSavings / original) * 100 : 0;

    return {
      finalPrice,
      totalSavings,
      effectiveDiscountRate,
    };
  }, [originalPrice, discountPercent, extraCouponPercent]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة الخصم والتخفيضات</h2>
          <p className="text-sm text-neutral-500">احسب السعر النهائي بعد التخفيض وقيمة التوفير الحقيقي مع الكوبونات الإضافية</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Tag className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              السعر الأصلي للسلعة:
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <span className="text-xs text-neutral-400 absolute left-3 top-3.5">ريال</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[50, 100, 250, 500, 1000].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOriginalPrice(p)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 tabular-nums"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              نسبة الخصم الأساسية (%):
            </label>
            <div className="flex gap-2 mb-2">
              {[10, 20, 25, 30, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    discountPercent === pct
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm tabular-nums text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              كود خصم إضافي (Coupon %) (اختياري):
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={extraCouponPercent}
              onChange={(e) => setExtraCouponPercent(Number(e.target.value))}
              placeholder="مثال: 10% إضافية"
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm tabular-nums text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">السعر النهائي بعد التخفيض</div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mb-4">
              {result.finalPrice.toFixed(2)}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال</span>
            </div>

            <div className="space-y-3 text-xs pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>السعر الأصلي السابق:</span>
                <span className="line-through text-neutral-400 tabular-nums text-sm">
                  {originalPrice.toFixed(2)} ريال
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إجمالي ما وفرته في هذه الصفقة:</span>
                </span>
                <span className="tabular-nums text-sm font-bold">
                  {result.totalSavings.toFixed(2)} ريال
                </span>
              </div>

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>نسبة الخصم الإجمالية الفعلية:</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                  %{result.effectiveDiscountRate.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-500">
            {extraCouponPercent > 0
              ? `تم تطبيق الخصم الأساسي (${discountPercent}%) ثم طُبق كود الكوبون (${extraCouponPercent}%) على السعر المخفض.`
              : 'وفرت قيمة مادية ملموسة بنسبة خصم مباشرة.'}
          </div>
        </div>
      </div>
    </div>
  );
};
