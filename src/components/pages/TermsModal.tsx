import React from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
              <FileText className="w-4 h-4" />
              <span>اتفاقية الاستخدام</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              شروط الاستخدام (Terms of Service)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            مرحباً بك في موقع <strong>PDFCalc Hub</strong>. باستخدامك لأدواتنا وحاسباتنا، فإنك تقر وتوافق على الالتزام بالشروط والبنود التالية:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">1. الاستخدام المسموح والمجاني</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                جميع الأدوات والحاسبات متاحة للاستخدام الشخصي والتجاري والمهني مجاناً. لا يجوز استخدام الأدوات في أي أنشطة تنتهك القوانين المحلية أو حقوق الملكية الفكرية للغير.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">2. إخلاء المسؤولية عن الحسابات المالية</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                تُقدم نتائج الحاسبات (مثل القروض، الضرائب، الإهلاك، وهوامش الربح) لأغراض إرشادية وتخطيطية عامة مبنية على المعادلات القياسية. ينبغي مراجعة مستشار مالي أو محاسب قانوني معتمد قبل اتخاذ قرارات استثمارية أو تقديم إقرارات ضريبية رسمية.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">3. ملكية الملفات والخصوصية</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                يحتفظ المستخدم بكامل حقوق الملكية للملفات التي يعالجها في الموقع. نظراً لأن المعالجة تتم داخل متصفح المستخدم مباشرة، فإن المستخدم هو المسؤول الحصري عن حفظ النسخ الاحتياطية لملفاته.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            موافق وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
