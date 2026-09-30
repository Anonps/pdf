import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';

interface GrowthRow {
  year: number;
  totalContributions: number;
  totalInterest: number;
  balance: number;
}

export const CompoundInterestCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(1000);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);
  const [showTable, setShowTable] = useState<boolean>(false);

  const stats = useMemo(() => {
    const P = Math.max(0, initialAmount);
    const PMT = Math.max(0, monthlyDeposit);
    const r = Math.max(0, annualRate) / 100;
    const n = 12; // Monthly compounding

    const rows: GrowthRow[] = [];
    let currentBalance = P;
    let totalDeposited = P;

    for (let yr = 1; yr <= years; yr++) {
      for (let m = 1; m <= 12; m++) {
        const monthlyInterest = currentBalance * (r / n);
        currentBalance += monthlyInterest + PMT;
        totalDeposited += PMT;
      }
      rows.push({
        year: yr,
        totalContributions: totalDeposited,
        totalInterest: Math.max(0, currentBalance - totalDeposited),
        balance: currentBalance,
      });
    }

    const futureValue = currentBalance;
    const totalInterestEarned = Math.max(0, futureValue - totalDeposited);

    return {
      futureValue,
      totalDeposited,
      totalInterestEarned,
      rows,
    };
  }, [initialAmount, monthlyDeposit, annualRate, years]);

  const interestShare = stats.futureValue > 0
    ? Math.round((stats.totalInterestEarned / stats.futureValue) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة الفائدة المركبة والاستثمار</h2>
          <p className="text-sm text-neutral-500">شاهد القوة التراكمية للأرباح المركبة وتوقع نمو ثروتك مع الوقت</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              رأس المال المبدئي (Initial Deposit):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <DollarSign className="w-5 h-5 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              الإيداع الشهري المنتظم (Monthly Contribution):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="250"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <DollarSign className="w-5 h-5 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                معدل العائد السنوي (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  max="30"
                  step="0.5"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
                <Percent className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                فترة الاستثمار (سنوات):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
                <Calendar className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">القيمة الإجمالية المتوقعة للمحفظة</div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mb-4">
              {stats.futureValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span>إجمالي ما أودعته ({100 - interestShare}%)</span>
                <span>الأرباح التراكمية المركبة ({interestShare}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${100 - interestShare}%` }}
                />
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${interestShare}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
              <div>
                <span className="text-neutral-500 block mb-0.5">إجمالي المبالغ المدفوعة منك</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums text-sm">
                  {stats.totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 0 })} ريال
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-0.5">صافي الأرباح المركبة</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                  + {stats.totalInterestEarned.toLocaleString('en-US', { maximumFractionDigits: 0 })} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
            <button
              onClick={() => setShowTable(!showTable)}
              className="w-full py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {showTable ? 'إخفاء جدول النمو السنوي' : 'عرض جدول نمو المحفظة سنة بسنة'}
            </button>
          </div>
        </div>
      </div>

      {showTable && (
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">
            جدول نمو رأس المال والأرباح السنوية
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold bg-neutral-50 dark:bg-neutral-800/40">
                  <th className="py-2.5 px-3">السنة</th>
                  <th className="py-2.5 px-3">إجمالي المساهمات</th>
                  <th className="py-2.5 px-3">الأرباح التراكمية</th>
                  <th className="py-2.5 px-3">رصيد نهاية السنة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-neutral-800 dark:text-neutral-200">
                {stats.rows.map((row) => (
                  <tr key={row.year} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-3 font-semibold">{row.year}</td>
                    <td className="py-2.5 px-3 tabular-nums">{row.totalContributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 tabular-nums text-emerald-600 dark:text-emerald-400">+{row.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 tabular-nums font-bold text-neutral-900 dark:text-white">{row.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
