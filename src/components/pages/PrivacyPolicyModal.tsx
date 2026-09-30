import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Cookie, Server } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>وثيقة قانونية رسمية</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              سياسة الخصوصية وأمان البيانات (Privacy Policy)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            تاريخ آخر تحديث: <strong>سبتمبر 2026</strong>. نولي في <strong>PDFCalc Hub</strong> أهمية قصوى لخصوصية وسرية بيانات زوارنا ومستخدمينا. توضح هذه الوثيقة بوضوح كيفية تعاملنا مع البيانات والملفات وفق أرقى المعايير الدولية وسياسات Google AdSense وGDPR.
          </p>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-2">
              <Lock className="w-4 h-4" />
              <h3>1. المعالجة المحلية لملفات PDF بنسبة 100% (Client-Side Privacy)</h3>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              جميع عمليات معالجة مستندات الـ PDF (الدمج، التقسيم، الضغط، العلامة المائية، تدوير الصفحات، وتحويل الصور) تتم بشكل مباشر وحصري داخل ذاكرة متصفح الإنترنت على جهازك الشخصي عبر لغة JavaScript وتقنيات WebAssembly. <strong>نحن لا نقوم برفع أو نقل أو حفظ أي ملف أو جزء من ملف إلى أي خادم خارجي على الإطلاق</strong>، مما يضمن استحالة وصول أي طرف ثالث أو حتى مطوري الموقع إلى مستنداتك وعقودك الخاصة.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-sm mb-2">
              <Server className="w-4 h-4 text-blue-500" />
              <h3>2. الحسابات والبيانات المالية والمحاسبية</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              جميع الأرقام والمبالغ والنسب التي تدخلها في حاسبات القروض، ضريبة القيمة المضافة، الرواتب، وإهلاك الأصول يتم احتسابها فورياً في متصفحك ولا يتم تسجيلها أو ربطها بهويتك الشخصية.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-sm mb-2">
              <Cookie className="w-4 h-4 text-amber-500" />
              <h3>3. إعلانات Google AdSense وملفات تعريف الارتباط (Cookies)</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
              <span>تستخدم Google وشركاؤها من موردي الإعلانات ملفات تعريف الارتباط (مثل ملف تعريف الارتباط DoubleClick DART) لعرض إعلانات ملائمة للمستخدمين استناداً إلى زياراتهم لموقعنا أو مواقع أخرى على الإنترنت.</span>
              <br />
              <span>يمكن للمستخدمين إلغاء الاشتراك في استخدام ملف تعريف الارتباط المخصص للإعلانات المستندة إلى الاهتمامات من خلال زيارة <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-emerald-600 underline">إعدادات إعلانات Google</a>.</span>
            </p>
          </div>

          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-2">
              4. ملفات السجل (Log Files)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              مثل معظم مواقع الويب، قد تجمع استضافتنا معلومات عامة غير محددة للهوية مثل عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، ومزود خدمة الإنترنت (ISP)، وذلك حصرياً لأغراض إدارة الخادم وتحليل حركة المرور العامة دون أي ربط بالبيانات الشخصية.
            </p>
          </div>
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
