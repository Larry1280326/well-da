import type { Locale } from "@/i18n/locale-context";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

type LocaleNavData = {
  navItems: NavItem[];
  contactInfo: {
    phone: string;
    phoneHref: string;
    email: string;
    emailHref: string;
  };
};

const en: LocaleNavData = {
  navItems: [
    {
      label: "About Us",
      href: "/about",
      children: [
        { label: "Company Profile", href: "/about#profile" },
        { label: "Work With Us", href: "/about#cta" },
        { label: "Core Value Proposition", href: "/about#core-value" },
        { label: "Trust Line", href: "/about#trust-line" },
      ],
    },
    {
      label: "Products & Applications",
      href: "/applications",
      children: [
        {
          label: "Custom Metal Enclosures",
          href: "/applications#custom-metal-enclosures",
        },
        {
          label: "Electrical and Control Boxes",
          href: "/applications#electrical-and-control-boxes",
        },
        {
          label: "Cabinets and Lockers",
          href: "/applications#cabinets-and-lockers",
        },
        {
          label: "Communication Equipment Housings",
          href: "/applications#communication-equipment-housings",
        },
        {
          label: "Security System Hardware",
          href: "/applications#security-system-hardware",
        },
        {
          label: "Non-Standard Metal Products",
          href: "/applications#non-standard-metal-products",
        },
      ],
    },
    {
      label: "Manufacturing Capabilities",
      href: "/manufacturing",
      children: [
        { label: "CNC Machining", href: "/manufacturing/cnc-machining" },
        {
          label: "Sheet Metal Fabrication",
          href: "/manufacturing/sheet-metal",
        },
        { label: "Die Casting", href: "/manufacturing/die-casting" },
        {
          label: "Surface Finishing",
          href: "/manufacturing/surface-finishing",
        },
      ],
    },
    {
      label: "Quality & Capabilities",
      href: "/quality",
      children: [
        { label: "Quality Control", href: "/quality/control" },
        { label: "Testing & Inspection", href: "/quality/testing" },
        { label: "Materials", href: "/quality/materials" },
      ],
    },
    {
      label: "Case Studies",
      href: "/case-studies",
      children: [
        {
          label: "Precision Components",
          href: "/case-studies/precision-components",
        },
        {
          label: "Custom Assemblies",
          href: "/case-studies/custom-assemblies",
        },
      ],
    },
    {
      label: "FAQ",
      href: "/faq",
      children: [
        { label: "Ordering & Lead Time", href: "/faq/ordering" },
        { label: "Shipping & Logistics", href: "/faq/shipping" },
        { label: "Technical Support", href: "/faq/support" },
      ],
    },
  ],
  contactInfo: {
    phone: "(+852) 2790 5008",
    phoneHref: "tel:+85227905008",
    email: "eng@wellda.com",
    emailHref: "mailto:eng@wellda.com",
  },
};

const zh: LocaleNavData = {
  navItems: [
    {
      label: "關於我們",
      href: "/about",
      children: [
        { label: "公司簡介", href: "/about#profile" },
        { label: "與我們合作", href: "/about#cta" },
        { label: "核心價值", href: "/about#core-value" },
        { label: "信任指標", href: "/about#trust-line" },
      ],
    },
    {
      label: "產品與應用",
      href: "/applications",
      children: [
        {
          label: "Custom Metal Enclosures",
          href: "/applications#custom-metal-enclosures",
        },
        {
          label: "Electrical and Control Boxes",
          href: "/applications#electrical-and-control-boxes",
        },
        {
          label: "Cabinets and Lockers",
          href: "/applications#cabinets-and-lockers",
        },
        {
          label: "Communication Equipment Housings",
          href: "/applications#communication-equipment-housings",
        },
        {
          label: "Security System Hardware",
          href: "/applications#security-system-hardware",
        },
        {
          label: "Non-Standard Metal Products",
          href: "/applications#non-standard-metal-products",
        },
      ],
    },
    {
      label: "製造能力",
      href: "/manufacturing",
      children: [
        { label: "CNC加工", href: "/manufacturing/cnc-machining" },
        { label: "鈑金製造", href: "/manufacturing/sheet-metal" },
        { label: "壓鑄", href: "/manufacturing/die-casting" },
        { label: "表面處理", href: "/manufacturing/surface-finishing" },
      ],
    },
    {
      label: "品質與能力",
      href: "/quality",
      children: [
        { label: "品質控制", href: "/quality/control" },
        { label: "測試與檢驗", href: "/quality/testing" },
        { label: "材料", href: "/quality/materials" },
      ],
    },
    {
      label: "案例研究",
      href: "/case-studies",
      children: [
        { label: "精密零件", href: "/case-studies/precision-components" },
        { label: "定制組件", href: "/case-studies/custom-assemblies" },
      ],
    },
    {
      label: "常見問題",
      href: "/faq",
      children: [
        { label: "訂購與交貨時間", href: "/faq/ordering" },
        { label: "運送與物流", href: "/faq/shipping" },
        { label: "技術支援", href: "/faq/support" },
      ],
    },
  ],
  contactInfo: {
    phone: "(+852) 2790 5008",
    phoneHref: "tel:+85227905008",
    email: "eng@wellda.com",
    emailHref: "mailto:eng@wellda.com",
  },
};

const data: Record<Locale, LocaleNavData> = { en, zh };

export function getNavItems(locale: Locale): NavItem[] {
  return data[locale].navItems;
}

export function getContactInfo(locale: Locale) {
  return data[locale].contactInfo;
}
