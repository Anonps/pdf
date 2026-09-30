import React, { useState } from 'react';
import { ChevronDown, HelpCircle, BookOpen, Lightbulb, FileSpreadsheet } from 'lucide-react';
import { ToolSeoContent } from '../types';

interface SeoContentSectionProps {
  content?: ToolSeoContent;
}

export const SeoContentSection: React.FC<SeoContentSectionProps> = ({ content }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!content) return null;

  return (
    <article className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
      {/* Title & Overview */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>المحتوى التعليمي والمرجع المحاسبي المعتمد</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
          {content.title}
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          {content.summary}
        </p>
      </div>

      {/* How it works grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3>خطوات وطريقة الاستخدام:</h3>
          </div>
          <ol className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-inside pr-1">
            {content.howItWorks.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-normal">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3>نصائح وملاحظات هامة:</h3>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300 list-disc list-inside pr-1">
            {content.tips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-normal">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formula & Example (if present) */}
      {(content.formula || content.exampleContent) && (
        <div className="mb-8 bg-neutral-100/70 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          {content.formula && (
            <div className="mb-5">
              <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-white mb-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                <h4>{content.formulaTitle || 'المعادلة المعتمدة:'}</h4>
              </div>
              <pre className="font-mono text-sm bg-neutral-900 text-emerald-400 p-3 rounded-lg overflow-x-auto dir-ltr text-left">
                <code>{content.formula}</code>
              </pre>
            </div>
          )}

          {content.exampleContent && (
            <div>
              <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-2">
                {content.exampleTitle || 'تطبيق عملي بالأرقام:'}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-800/80 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                {content.exampleContent}
              </p>
            </div>
          )}
        </div>
      )}

      {/* FAQ Accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 font-bold text-lg text-neutral-900 dark:text-white mb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h3>الأسئلة الشائعة (FAQ)</h3>
          </div>

          <div className="space-y-3">
            {content.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-right px-5 py-4 flex items-center justify-between gap-4 font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
