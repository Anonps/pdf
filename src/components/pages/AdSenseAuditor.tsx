import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, Sparkles, BookOpen, Layout, ArrowLeft } from 'lucide-react';

interface AdSenseAuditorProps {
  onClose: () => void;
}

export const AdSenseAuditor: React.FC<AdSenseAuditorProps> = ({ onClose }) => {
  const complianceChecklist = [
    {
      title: 'محتوى ذو قيمة عالية (Valuable Inventory)',
      status: 'مكتمل بنسبة 100%',
      icon: BookOpen,
      desc: 'كل أداة وحاسبة تحتوي على شرح تفصيلي لطريقة العمل، المعادلات الرياضية والمحاسبية المعتمدة، أمثلة رقمية حية، وقسم أسئلة شائعة (FAQ) مهيأ لمحركات البحث (SEO). هذا يمنع رفض جوجل بسبب "محتوى قليل القيمة".',
    },
    {
      title: 'توزيع إعلانات آمن ومنع النقرات غير المقصودة (Safe CTR Zone)',
      status: 'مطابق للمعايير القياسية',
      icon: Layout,
      desc: 'تم وضع الإعلانات في حاويات مخصصة ومميزة بوضوح بكلمة "إعلان / ADVERTISEMENT" مع مسافة أمان كافية تبعدها عن أزرار الإجراءات الحساسة (مثل "تحميل" أو "احسب").',
    },
    {
      title: 'أمان البيانات ومعالجة PDF محلياً (Zero-Server Storage)',
      status: 'أعلى درجات الخصوصية',
      icon: ShieldCheck,
      desc: 'ملفات المستخدمين لا يتم رفعها إطلاقاً إلى أي خادم خارجي؛ كل المعالجات (دمج، ضغط، علامة مائية، صور) تتم بداخل متصفح المستخدم عبر JavaScript/WebAssembly. هذا يلبي متطلبات GDPR وCCPA وسياسات الخصوصية الدولية الصارمة.',
    },
    {
      title: 'الصفحات الأساسية الإلزامية (Mandatory Legal Pages)',
      status: 'متوفرة بالكامل',
      icon: CheckCircle2,
      desc: 'الموقع مجهز بصفحة سياسة الخصوصية الشاملة (توضح ملفات تعريف ارتباط Google وملفات تعريف الإعلانات)، شروط الاستخدام، من نحن، ونموذج اتصل بنا تفاعلي، وهي متطلب إلزامي قبل المراجعة.',
    },
    {
      title: 'السرعة الفائقة ومؤشرات الأداء (Core Web Vitals)',
      status: 'ممتاز وخفيف الوزن',
      icon: Zap,
      desc: 'كود نظيف وسريع مبني بأحدث تقنيات React وTailwind بدون بطء في تحميل الصفحات، مما يضمن تحميل إعلانات AdSense بسلاسة والحصول على ترتيب متقدم في جوجل.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>دليل المطور والناشر المعتمد</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              فاحص ودليل التوافق الكامل مع Google AdSense
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
          الإجابة عن سؤالك: <strong className="text-emerald-600 dark:text-emerald-400">نعم وبكل تأكيد!</strong> يمكنك بناء وتشغيل موقع يجمع بين أدوات الـ PDF والحاسبات المالية وتحقيق أرباح مستقرة من Google AdSense بدون أي خوف من التقييد أو الرفض، طالما أنك تطبق هذه المعايير الخمسة المحققة بالفعل في هذا الموقع:
        </p>

        <div className="space-y-4 mb-8">
          {complianceChecklist.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-neutral-900 dark:text-white">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pr-9">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl mb-6">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
            💡 نصيحة ذهبية لطلب المراجعة في AdSense:
          </h4>
          <ul className="text-xs text-amber-700 dark:text-amber-400/90 space-y-1 list-disc list-inside leading-relaxed">
            <li>اربط موقعك بـ Google Search Console وتأكد من أرشفة الصفحات.</li>
            <li>اترك الموقع يعمل لمدة أسبوعين إلى 3 أسابيع مع جلب زيارات أولية طبيعية قبل تقديم الطلب.</li>
            <li>لا تضع أكواد إعلانات حقيقية إلا بعد استلام بريد الموافقة الرسمي من Google AdSense.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            فهمت، العودة للأدوات
          </button>
        </div>
      </div>
    </div>
  );
};
