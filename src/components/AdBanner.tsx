import React from 'react';

interface AdBannerProps {
  slot: 'top-header' | 'in-content' | 'sidebar' | 'bottom-footer';
  format?: 'horizontal' | 'rectangle';
  showMockAds?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  format = 'horizontal',
  showMockAds = true,
}) => {
  return (
    <aside
      aria-label="إعلان / Advertisement"
      className="my-8 mx-auto w-full max-w-4xl text-center select-none"
    >
      {/* Policy requirement: Explicit Ad Labeling */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1 px-3">
        <span className="tracking-wide">إعلان / ADVERTISEMENT</span>
        <span className="text-[10px]">Google AdSense Compliant Slot</span>
      </div>

      {showMockAds ? (
        <div
          className={`border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 rounded-lg p-4 flex flex-col items-center justify-center transition-all ${
            format === 'horizontal' ? 'min-h-[100px]' : 'min-h-[260px]'
          }`}
        >
          <div className="flex items-center gap-3 text-neutral-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium">مساحة إعلانية معتمدة ومطابقة لسياسات Google AdSense</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-md">
            موضع متباعد بشكل آمن عن أزرار العمليات لمنع النقرات العرضية وضمان أعلى معايير الجودة (CTR Safety Zone - {slot})
          </p>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-3 text-neutral-400 text-xs">
          [حاوية إعلان متجاوبة - معطلة في وضع المعاينة الهادئ]
        </div>
      )}
    </aside>
  );
};
