import React from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { ToolCategory } from '../types';

interface NavbarProps {
  activeCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  onOpenAdSenseGuide: () => void;
  showMockAds: boolean;
  onToggleMockAds: () => void;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenAdSenseGuide,
  showMockAds,
  onToggleMockAds,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element Brand wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('pdf');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5"
        >
          <span className="text-emerald-600 dark:text-emerald-400">PDFCalc</span>
          <span>Hub</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => onSelectCategory('pdf')}
            className={`transition-colors whitespace-nowrap ${
              activeCategory === 'pdf'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            أدوات PDF
          </button>
          <button
            onClick={() => onSelectCategory('accounting')}
            className={`transition-colors whitespace-nowrap ${
              activeCategory === 'accounting'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            حاسبات مالية
          </button>
          <button
            onClick={onOpenAdSenseGuide}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>معايير AdSense</span>
          </button>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap text-neutral-500"
          >
            الخصوصية والأمان
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Toggle mock ads */}
          <button
            onClick={onToggleMockAds}
            title={showMockAds ? 'إخفاء معاينة مواضع الإعلانات' : 'إظهار معاينة مواضع الإعلانات'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            {showMockAds ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">معاينة الإعلانات: مفعلة</span>
                <span className="sm:hidden">إعلانات</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">معاينة الإعلانات: هادئ</span>
                <span className="sm:hidden">إعلانات</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAdSenseGuide}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors whitespace-nowrap"
          >
            فاحص القبول
          </button>
        </div>
      </div>
    </header>
  );
};
