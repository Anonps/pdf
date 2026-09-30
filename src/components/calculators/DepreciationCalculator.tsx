import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface DepreciationYear {
  year: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

export const DepreciationCalculator: React.FC = () => {
  const [cost, setCost] = useState<number>(50000);
  const [salvage, setSalvage] = useState<number>(5000);
  const [lifespanYears, setLifespanYears] = useState<number>(5);
  const [method, setMethod] = useState<'straight-line' | 'declining'>('straight-line');

  const schedule = useMemo(() => {
    const C = Math.max(0, cost);
    const S = Math.min(C, Math.max(0, salvage));
    const N = Math.max(1, lifespanYears);

    const rows: DepreciationYear[] = [];
    let currentBookValue = C;
    let totalAccDep = 0;

    if (method === 'straight-line') {
      const annualDep = (C - S) / N;
      for (let yr = 1; yr <= N; yr++) {
        totalAccDep += annualDep;
        currentBookValue = Math.max(S, C - totalAccDep);
        rows.push({
          year: yr,
          depreciationExpense: annualDep,
          accumulatedDepreciation: totalAccDep,
          bookValue: currentBookValue,
        });
      }
    } else {
      // Double declining balance (2 / N)
      const rate = 2 / N;
      for (let yr = 1; yr <= N; yr++) {
        let dep = currentBookValue * rate;
        if (currentBookValue - dep < S) {
          dep = Math.max(0, currentBookValue - S);
        }
        totalAccDep += dep;
        currentBookValue = Math.max(S, currentBookValue - dep);
        rows.push({
          year: yr,
          depreciationExpense: dep,
          accumulatedDepreciation: totalAccDep,
          bookValue: currentBookValue,
        });
      }
    }

    return rows;
  }, [cost, salvage, lifespanYears, method]);

  const annualStraightLine = lifespanYears > 0 ? (cost - salvage) / lifespanYears : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة إهلاك الأصول الثابتة</h2>
          <p className="text-sm text-neutral-500">حساب مصروف الإهلاك السنوي وجدول القيمة الدفترية للأصل</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              تكلفة شراء الأصل (Historical Cost):
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                القيمة التخريدية (Salvage Value):
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={salvage}
                onChange={(e) => setSalvage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                العمر الإنتاجي (بالسنوات):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={lifespanYears}
                onChange={(e) => setLifespanYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              طريقة الإهلاك:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('straight-line')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  method === 'straight-line'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                القسط الثابت (Straight-Line)
              </button>
              <button
                type="button"
                onClick={() => setMethod('declining')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  method === 'declining'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                القسط المتناقص المضاعف (Declining)
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">
              {method === 'straight-line' ? 'قسط الإهلاك السنوي الثابت' : 'إهلاك السنة الأولى'}
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mb-4">
              {method === 'straight-line'
                ? annualStraightLine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : (schedule[0]?.depreciationExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال / سنة</span>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-neutral-200 dark:border-neutral-700/60">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>القيمة القابلة للإهلاك:</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                  {(cost - salvage).toLocaleString()} ريال
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>القيمة الدفترية في نهاية العمر:</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                  {salvage.toLocaleString()} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-500">
            {method === 'straight-line'
              ? 'توزع التكلفة بالتساوي على جميع السنوات (الأكثر شيوعاً للأثاث والمباني).'
              : 'تحمل السنوات الأولى النصيب الأكبر من عبء الإهلاك (مناسب للمركبات والآلات).'}
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
          جدول الإهلاك السنوي وتطور القيمة الدفترية
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold bg-neutral-50 dark:bg-neutral-800/40">
                <th className="py-2.5 px-3">السنة</th>
                <th className="py-2.5 px-3">مصروف الإهلاك</th>
                <th className="py-2.5 px-3">مجمع الإهلاك</th>
                <th className="py-2.5 px-3">القيمة الدفترية المتبقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-neutral-800 dark:text-neutral-200">
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <td className="py-2.5 px-3 font-semibold">{row.year}</td>
                  <td className="py-2.5 px-3 tabular-nums text-amber-600 dark:text-amber-400">
                    {row.depreciationExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    {row.accumulatedDepreciation.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                    {row.bookValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
