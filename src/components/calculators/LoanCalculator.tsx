import React, { useState, useMemo } from 'react';
import { Landmark, Calendar, Percent, CircleDollarSign } from 'lucide-react';

interface AmortizationYearRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  remainingBalance: number;
}

export const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(5.5);
  const [termYears, setTermYears] = useState<number>(5);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const calculation = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const r = Math.max(0, annualRate) / 100 / 12;
    const n = Math.max(1, termYears * 12);

    if (P === 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        schedule: [] as AmortizationYearRow[],
      };
    }

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = Math.max(0, totalPayment - P);

    // Generate yearly amortization summary
    const schedule: AmortizationYearRow[] = [];
    let currentBalance = P;

    for (let yr = 1; yr <= termYears; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;

      for (let m = 1; m <= 12; m++) {
        if (currentBalance <= 0) break;
        const interestPayment = currentBalance * r;
        const principalPayment = Math.min(currentBalance, monthlyPayment - interestPayment);

        yrInterest += interestPayment;
        yrPrincipal += principalPayment;
        currentBalance -= principalPayment;
      }

      schedule.push({
        year: yr,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        totalPaid: yrPrincipal + yrInterest,
        remainingBalance: Math.max(0, currentBalance),
      });
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    };
  }, [loanAmount, annualRate, termYears]);

  const interestPercentage = calculation.totalPayment > 0
    ? Math.round((calculation.totalInterest / calculation.totalPayment) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة القروض والتمويل</h2>
          <p className="text-sm text-neutral-500">حساب القسط الشهري، إجمالي الفوائد/المرابحة، وجدول استهلاك الدين</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Landmark className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Inputs Column */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              مبلغ التمويل / القرض (Principal):
            </label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <CircleDollarSign className="w-5 h-5 text-neutral-400 absolute right-3 top-3" />
            </div>
            <div className="flex gap-2 mt-2">
              {[50000, 100000, 250000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 tabular-nums"
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              معدل الفائدة / المرابحة السنوي (APR %):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                max="30"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <Percent className="w-5 h-5 text-neutral-400 absolute right-3 top-3" />
            </div>
            <div className="flex gap-2 mt-2">
              {[3.5, 4.5, 5.5, 7.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setAnnualRate(rate)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 tabular-nums"
                >
                  %{rate}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              مدة التمويل (بالسنوات):
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="30"
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <Calendar className="w-5 h-5 text-neutral-400 absolute right-3 top-3" />
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 3, 5, 10, 20].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTermYears(yr)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 tabular-nums"
                >
                  {yr} {yr === 1 ? 'سنة' : 'سنوات'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card Column */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">القسط الشهري المقدر</div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mb-4">
              {calculation.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال / شهر</span>
            </div>

            {/* Visual Balance Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span>أصل الدين ({100 - interestPercentage}%)</span>
                <span>إجمالي الفائدة ({interestPercentage}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${100 - interestPercentage}%` }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${interestPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
              <div>
                <span className="text-neutral-500 block mb-0.5">إجمالي الفوائد / الأرباح</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums text-sm">
                  {calculation.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-0.5">إجمالي المبلغ المسدد</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums text-sm">
                  {calculation.totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {showSchedule ? 'إخفاء جدول استهلاك الدين' : 'عرض جدول استهلاك الدين السنوي (Amortization)'}
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      {showSchedule && (
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">
            جدول استهلاك الدين السنوي (Amortization Schedule)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold bg-neutral-50 dark:bg-neutral-800/40">
                  <th className="py-2.5 px-3">السنة</th>
                  <th className="py-2.5 px-3">سداد أصل الدين</th>
                  <th className="py-2.5 px-3">سداد الفوائد</th>
                  <th className="py-2.5 px-3">إجمالي المسدد سنوياً</th>
                  <th className="py-2.5 px-3">الرصيد المتبقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-neutral-800 dark:text-neutral-200">
                {calculation.schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-3 font-semibold">{row.year}</td>
                    <td className="py-2.5 px-3 tabular-nums">{row.principalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 tabular-nums text-amber-600 dark:text-amber-400">{row.interestPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 tabular-nums font-medium">{row.totalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">{row.remainingBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
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
