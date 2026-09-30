import React, { useState } from 'react';
import {
  Type,
  Files,
  Scissors,
  FileArchive,
  Stamp,
  RotateCw,
  Image as ImageIcon,
  Landmark,
  Receipt,
  TrendingUp,
  Calculator,
  Coins,
  BarChart3,
  Tag,
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
} from 'lucide-react';

import { ToolCategory, ToolId } from './types';
import { TOOLS_LIST, TOOLS_SEO_CONTENT } from './data/toolsData';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { SeoContentSection } from './components/SeoContentSection';

// PDF Tools
import { EditPdfTextTool } from './components/pdf/EditPdfTextTool';
import { MergePdfTool } from './components/pdf/MergePdfTool';
import { SplitPdfTool } from './components/pdf/SplitPdfTool';
import { CompressPdfTool } from './components/pdf/CompressPdfTool';
import { WatermarkPdfTool } from './components/pdf/WatermarkPdfTool';
import { RotatePdfTool } from './components/pdf/RotatePdfTool';
import { ImagesToPdfTool } from './components/pdf/ImagesToPdfTool';

// Accounting & Financial Calculators
import { LoanCalculator } from './components/calculators/LoanCalculator';
import { VatCalculator } from './components/calculators/VatCalculator';
import { CompoundInterestCalculator } from './components/calculators/CompoundInterestCalculator';
import { ProfitMarginCalculator } from './components/calculators/ProfitMarginCalculator';
import { SalaryCalculator } from './components/calculators/SalaryCalculator';
import { DepreciationCalculator } from './components/calculators/DepreciationCalculator';
import { DiscountCalculator } from './components/calculators/DiscountCalculator';

// Legal & Compliance Modals
import { AdSenseAuditor } from './components/pages/AdSenseAuditor';
import { PrivacyPolicyModal } from './components/pages/PrivacyPolicyModal';
import { TermsModal } from './components/pages/TermsModal';
import { AboutModal } from './components/pages/AboutModal';
import { ContactModal } from './components/pages/ContactModal';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('pdf');
  const [activeToolId, setActiveToolId] = useState<ToolId>('pdf-edit');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMockAds, setShowMockAds] = useState<boolean>(true);

  // Modals state
  const [showAdSenseGuide, setShowAdSenseGuide] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);

  // Filter tools based on category and search
  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory = tool.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      tool.titleAr.toLowerCase().includes(query) ||
      tool.titleEn.toLowerCase().includes(query) ||
      tool.descAr.toLowerCase().includes(query);

    return matchesQuery;
  });

  const activeTool = TOOLS_LIST.find((t) => t.id === activeToolId) || TOOLS_LIST[0];
  const activeSeoContent = TOOLS_SEO_CONTENT[activeToolId];

  // Map icon name to Lucide component
  const renderToolIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Type':
        return <Type className={className} />;
      case 'Files':
        return <Files className={className} />;
      case 'Scissors':
        return <Scissors className={className} />;
      case 'FileArchive':
        return <FileArchive className={className} />;
      case 'Stamp':
        return <Stamp className={className} />;
      case 'RotateCw':
        return <RotateCw className={className} />;
      case 'Image':
        return <ImageIcon className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'Receipt':
        return <Receipt className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Calculator':
        return <Calculator className={className} />;
      case 'Coins':
        return <Coins className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      case 'Tag':
        return <Tag className={className} />;
      default:
        return <Files className={className} />;
    }
  };

  const renderActiveToolComponent = () => {
    switch (activeToolId) {
      case 'pdf-edit':
        return <EditPdfTextTool />;
      case 'pdf-merge':
        return <MergePdfTool />;
      case 'pdf-split':
        return <SplitPdfTool />;
      case 'pdf-compress':
        return <CompressPdfTool />;
      case 'pdf-watermark':
        return <WatermarkPdfTool />;
      case 'pdf-rotate':
        return <RotatePdfTool />;
      case 'pdf-images':
        return <ImagesToPdfTool />;
      case 'calc-loan':
        return <LoanCalculator />;
      case 'calc-vat':
        return <VatCalculator />;
      case 'calc-compound':
        return <CompoundInterestCalculator />;
      case 'calc-margin':
        return <ProfitMarginCalculator />;
      case 'calc-salary':
        return <SalaryCalculator />;
      case 'calc-depreciation':
        return <DepreciationCalculator />;
      case 'calc-discount':
        return <DiscountCalculator />;
      default:
        return <MergePdfTool />;
    }
  };

  const selectTool = (tool: typeof activeTool) => {
    setActiveToolId(tool.id);
    setActiveCategory(tool.category);
    // Smooth scroll up to tool area
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          // Set default tool for category
          if (cat === 'pdf') setActiveToolId('pdf-edit');
          if (cat === 'accounting') setActiveToolId('calc-loan');
        }}
        onOpenAdSenseGuide={() => setShowAdSenseGuide(true)}
        showMockAds={showMockAds}
        onToggleMockAds={() => setShowMockAds(!showMockAds)}
        onOpenPrivacy={() => setShowPrivacy(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Top Header Ad Placement (Compliant Leaderboard Slot) */}
        <AdBanner slot="top-header" format="horizontal" showMockAds={showMockAds} />

        {/* Hero Section */}
        <section className="text-center py-6 md:py-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/50 dark:border-emerald-800/50 mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>معالجة محلية بالكامل في متصفحك 100% · خصوصية مطلقة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 leading-tight">
            أدوات PDF سريعة وحاسبات مالية ومحاسبية معتمدة
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            منصة متكاملة مستوحاة من كبرى مواقع الأدوات والحاسبات مثل calculator.net، مجهزة بمعادلات محاسبية دقيقة ومعالجة محلية لملفاتك متوافقة تماماً مع معايير Google AdSense وSEO.
          </p>

          {/* Quick Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أداة أو حاسبة (مثال: دمج، قرض، ضريبة، إهلاك)..."
              className="w-full pl-4 pr-11 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl text-sm shadow-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-5 h-5 text-neutral-400 absolute right-4 top-3.5" />
          </div>

          {/* Category Tabs */}
          <div className="inline-flex p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-2xl shadow-inner">
            <button
              onClick={() => {
                setActiveCategory('pdf');
                if (activeTool.category !== 'pdf') setActiveToolId('pdf-edit');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeCategory === 'pdf'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Files className="w-4 h-4 text-red-500" />
              <span>أدوات الـ PDF</span>
            </button>
            <button
              onClick={() => {
                setActiveCategory('accounting');
                if (activeTool.category !== 'accounting') setActiveToolId('calc-loan');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeCategory === 'accounting'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>حاسبات المحاسبة والمال</span>
            </button>
          </div>
        </section>

        {/* Tools Selector Strip (Horizontal pill navigation) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredTools.map((tool) => {
              const isSelected = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {renderToolIcon(tool.iconName, 'w-4 h-4')}
                  <span>{tool.titleAr}</span>
                  {tool.popular && !isSelected && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      شائع
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Work Area: Active Tool */}
        <section className="mb-10">
          {renderActiveToolComponent()}
        </section>

        {/* In-Content Safe Ad Placement (Proper spacing prevents accidental clicks) */}
        <AdBanner slot="in-content" format="horizontal" showMockAds={showMockAds} />

        {/* Rich SEO Content, Formula and FAQ Section */}
        <SeoContentSection content={activeSeoContent} />

        {/* Other Recommended Tools Grid (Boosts session duration & SEO crawlability) */}
        <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                تصفح المزيد من الأدوات والحاسبات
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                جميع الأدوات تعمل مجاناً وبأعلى درجات الخصوصية داخل متصفحك
              </p>
            </div>
            <button
              onClick={() => {
                setActiveCategory(activeCategory === 'pdf' ? 'accounting' : 'pdf');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{activeCategory === 'pdf' ? 'انتقل إلى الحاسبات المالية' : 'انتقل إلى أدوات PDF'}</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TOOLS_LIST.filter((t) => t.id !== activeToolId).slice(0, 8).map((tool) => (
              <button
                key={tool.id}
                onClick={() => selectTool(tool)}
                className="text-right p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:text-emerald-600 transition-colors">
                      {renderToolIcon(tool.iconName, 'w-4 h-4')}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {tool.badgeAr}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">
                    {tool.titleAr}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {tool.descAr}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                  <span>فتح الأداة</span>
                  <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AdSense Compliance Quick Banner */}
        <section className="mt-16 p-6 bg-linear-to-r from-emerald-900 to-neutral-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>جاهزية 100% لمعايير Google AdSense</span>
            </div>
            <h3 className="text-xl font-bold">
              هل تريد معرفة سبب قبول هذا النوع من المواقع في AdSense بسهولة؟
            </h3>
            <p className="text-xs text-neutral-300 max-w-xl">
              اطلع على دليل المعايير الكامل الذي يشرح كيفية تفادي الرفض بسبب "محتوى قليل القيمة" وضمان تجربة إعلانية نظيفة ومربحة.
            </p>
          </div>
          <button
            onClick={() => setShowAdSenseGuide(true)}
            className="px-6 py-3 bg-white text-neutral-900 text-xs font-bold rounded-xl hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            فتح فاحص ودليل AdSense
          </button>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setShowPrivacy(true)}
        onOpenTerms={() => setShowTerms(true)}
        onOpenAbout={() => setShowAbout(true)}
        onOpenContact={() => setShowContact(true)}
        onOpenAdSenseGuide={() => setShowAdSenseGuide(true)}
      />

      {/* Modals */}
      {showAdSenseGuide && <AdSenseAuditor onClose={() => setShowAdSenseGuide(false)} />}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
}
