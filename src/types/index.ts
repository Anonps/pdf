export type ToolCategory = 'pdf' | 'accounting' | 'adsense-guide';

export type ToolId =
  // PDF tools
  | 'pdf-edit'
  | 'pdf-merge'
  | 'pdf-split'
  | 'pdf-compress'
  | 'pdf-watermark'
  | 'pdf-rotate'
  | 'pdf-images'
  // Financial Calculators
  | 'calc-loan'
  | 'calc-vat'
  | 'calc-compound'
  | 'calc-margin'
  | 'calc-salary'
  | 'calc-depreciation'
  | 'calc-discount';

export interface ToolItem {
  id: ToolId;
  category: 'pdf' | 'accounting';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  iconName: string;
  popular?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoContent {
  title: string;
  summary: string;
  howItWorks: string[];
  formulaTitle?: string;
  formula?: string;
  exampleTitle?: string;
  exampleContent?: string;
  faqs: FaqItem[];
  tips: string[];
}
