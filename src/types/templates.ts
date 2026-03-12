export type TemplateHardware = "chroma42" | "chroma29" | "lcd";

export interface TemplateItem {
  id: string;
  name: string;
  hw: TemplateHardware;
  hwLabel: string;
  headerBg: string;
  headerText: string;
  tags: string[];
  isDefault: boolean;
  usedCount: number;
  productLine?: string;
}

export interface HwFilterOption {
  id: string;
  label: string;
}

export interface TemplateVariant {
  id: string;
  label: string;
  headerBg: string;
  headerText: string;
  subText: string;
}

export interface BuiltinTemplate {
  id: string;
  name: string;
  hw: TemplateHardware;
  headerBg: string;
  headerText: string;
  tags: string[];
  variants: TemplateVariant[];
}
