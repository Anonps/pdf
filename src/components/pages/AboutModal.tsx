import React from 'react';
import { ArrowLeft, Users, Shield, Award, Zap } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
              <Users className="w-4 h-4" />
              <span>نبذة عن المنصة</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              من نحن (About PDFCalc Hub)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            تأسست <strong>PDFCalc Hub</strong> لتوفير تجربة ويب استثنائية تجمع بين وظيفتين أساسيتين يحتاجهما كل صاحب عمل ومحاسب وطالب يومياً: <strong>أدوات تعديل الـ PDF السريعة</strong> و<strong>الحاسبات المالية والمحاسبية الدقيقة</strong> المستوحاة من معايير المواقع الرائدة مثل calculator.net.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 text-center">
              <Shield className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">خصوصية لا تقبل المساومة</h4>
              <p className="text-[11px] text-neutral-400">معالجة المستندات بنسبة 100% داخل جهاز المستخدم دون رفعها لأي سيرفر.</p>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 text-center">
              <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">دقة محاسبية معتمدة</h4>
              <p className="text-[11px] text-neutral-400">معادلات مالية ورياضية مطابقة للأنظمة الضريبية والمعايير المحاسبية.</p>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 text-center">
              <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">سرعة وسهولة مطلقة</h4>
              <p className="text-[11px] text-neutral-400">بدون تسجيل، بدون اشتراكات، وبواجهة خفيفة تخدمك في ثوانٍ معدودة.</p>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            نهدف لأن نكون المرجع العربي الأول والموثوق للمستقلين وأصحاب المشاريع والشركات الناشئة لإنهاء مهام المستندات والحسابات بضغطة زر واحدة.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
