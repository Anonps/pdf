import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenAdSenseGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
  onOpenContact,
  onOpenAdSenseGuide,
}) => {
  return (
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 py-12 text-neutral-600 dark:text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              PDFCalc <span className="text-emerald-600 dark:text-emerald-400">Hub</span>
            </span>
            <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
              منصة إنتاجية عربية شاملة تجمع بين أدوات تعديل ومستندات الـ PDF مع الحفاظ التام على الخصوصية محلياً 100%، وحاسبات مالية ومحاسبية متقدمة ودقيقة تحاكي كبرى المنصات العالمية مثل calculator.net، ومصممة بأعلى معايير التوافق مع Google AdSense.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>خصوصية آمنة: لا يتم حفظ أو نقل ملفاتك إلى أي خادم خارجي.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              الصفحات القانونية والسياسات
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  سياسة الخصوصية وأمان البيانات
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  شروط الاستخدام وإخلاء المسؤولية
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdSenseGuide}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  دليل قبول ومعايير Google AdSense
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              عن المنصة والدعم
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  من نحن
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  اتصل بنا والدعم الفني
                </button>
              </li>
              <li>
                <span className="text-[11px] text-neutral-400">
                  ساعات الاستجابة: خلال 24 ساعة
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} PDFCalc Hub. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>صُممت بعناية فائقة وتوافق تام مع محركات البحث وسياسات الإعلانات النظيفة</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
