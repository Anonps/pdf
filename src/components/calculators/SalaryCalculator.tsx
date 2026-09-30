import React, { useState, useMemo } from 'react';
import { Coins, Shield } from 'lucide-react';

export const SalaryCalculator: React.FC = () => {
  const [basicSalary, setBasicSalary] = useState<number>(8000);
  const [housingAllowance, setHousingAllowance] = useState<number>(2000);
  const [transportAllowance, setTransportAllowance] = useState<number>(1000);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);
  const [gosiRate, setGosiRate] = useState<number>(9.75); // Saudi GOSI employee share
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  const calc = useMemo(() => {
    const basic = Math.max(0, basicSalary);
    const housing = Math.max(0, housingAllowance);
    const transport = Math.max(0, transportAllowance);
    const others = Math.max(0, otherAllowances);

    const grossSalary = basic + housing + transport + others;

    // GOSI base is typically Basic + Housing
    const gosiBase = basic + housing;
    const gosiDeduction = gosiBase * (Math.max(0, gosiRate) / 100);

    const extraDeductions = Math.max(0, otherDeductions);
    const totalDeductions = gosiDeduction + extraDeductions;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    return {
      grossSalary,
      gosiBase,
      gosiDeduction,
      totalDeductions,
      netSalary,
    };
  }, [basicSalary, housingAllowance, transportAllowance, otherAllowances, gosiRate, otherDeductions]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">حاسبة الراتب وصافي الدخل</h2>
          <p className="text-sm text-neutral-500">حساب الراتب الإجمالي وصافي المبلغ المحول للبنك بعد استقطاع التأمينات</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Coins className="w-5 h-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                الراتب الأساسي:
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                بدل السكن:
              </label>
              <input
                type="number"
                min="0"
                step="250"
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                بدل النقل:
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={transportAllowance}
                onChange={(e) => setTransportAllowance(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                بدلات أخرى / حوافز:
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={otherAllowances}
                onChange={(e) => setOtherAllowances(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              نسبة استقطاع التأمينات (GOSI):
            </label>
            <div className="flex gap-2">
              {[
                { label: '9.75% (سعودي)', rate: 9.75 },
                { label: '10% (سابق / عام)', rate: 10 },
                { label: '0% (غير خاضع)', rate: 0 },
              ].map((opt) => (
                <button
                  key={opt.rate}
                  type="button"
                  onClick={() => setGosiRate(opt.rate)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    gosiRate === opt.rate
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              خصومات أو أقساط أخرى (اختياري):
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white tabular-nums"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium mb-1">صافي الراتب المستحق للتحويل</div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mb-4">
              {calc.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-neutral-500 mr-2">ريال / شهر</span>
            </div>

            <div className="space-y-2.5 text-xs pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>إجمالي الراتب الاسمي:</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                  {calc.grossSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>وعاء التأمينات (الأساسي + السكن):</span>
                <span className="tabular-nums">
                  {calc.gosiBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>

              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>خصم التأمينات الاجتماعية ({gosiRate}%):</span>
                <span className="font-bold tabular-nums">
                  - {calc.gosiDeduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                </span>
              </div>

              {otherDeductions > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>خصومات إضافية:</span>
                  <span className="tabular-nums">- {otherDeductions.toFixed(2)} ريال</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              نسبة الاستقطاع المعتمدة للموظف السعودي في التأمينات هي 9.75% (9% معاشات + 0.75% ساند).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
