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
        { label: "Core Value Proposition", href: "/about#core-value" },
        { label: "Work With Us", href: "/about#cta" },
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
        {
          label: "Integrated Sheet Metal Manufacturing",
          href: "/manufacturing#integrated_sheet_metal",
        },
      ],
    },
    {
      label: "Quality & Tolerance",
      href: "/quality",
      children: [
        {
          label: "Quality Control",
          href: "/quality#control",
        },
      ],
    },
    {
      label: "Case Studies",
      href: "/case-studies",
      children: [
        {
          label: "Electrical Enclosure",
          href: "/case-studies#flat-sheet-to-electrical-enclosure",
        },
        {
          label: "Kiosk Enclosure",
          href: "/case-studies#ordering-kiosk-enclosures",
        },
      ],
    },
    {
      label: "FAQ",
      href: "/faq",
      children: [
        { label: "Products & Orders", href: "/faq#products-orders" },
        { label: "Manufacturing & Capabilities", href: "/faq#manufacturing-capabilities" },
        { label: "Lead Time & Finishing", href: "/faq#lead-time-finishing" },
        { label: "Quality & Compliance", href: "/faq#quality-compliance" },
        { label: "Shipping & Quotation", href: "/faq#shipping-quotation" },
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
          label: "訂製金屬外殼",
          href: "/applications#custom-metal-enclosures",
        },
        {
          label: "電氣與控制箱",
          href: "/applications#electrical-and-control-boxes",
        },
        {
          label: "機櫃與儲物櫃",
          href: "/applications#cabinets-and-lockers",
        },
        {
          label: "通訊設備外殼",
          href: "/applications#communication-equipment-housings",
        },
        {
          label: "安防系統硬體",
          href: "/applications#security-system-hardware",
        },
        {
          label: "非標準金屬產品",
          href: "/applications#non-standard-metal-products",
        },
      ],
    },
    {
      label: "製造能力",
      href: "/manufacturing",
      children: [
        {
          label: "鈑金加工能力",
          href: "/manufacturing#integrated_sheet_metal",
        },
      ],
    },
    {
      label: "品質與公差",
      href: "/quality",
      children: [
        {
          label: "品質控制",
          href: "/quality#control",
        },
      ],
    },
    {
      label: "案例研究",
      href: "/case-studies",
      children: [
        {
          label: "電氣外殼",
          href: "/case-studies#flat-sheet-to-electrical-enclosure",
        },
        {
          label: "售貨機外殼",
          href: "/case-studies#ordering-kiosk-enclosures",
        },
      ],
    },
    {
      label: "常見問題",
      href: "/faq",
      children: [
        { label: "產品與訂單", href: "/faq#products-orders" },
        { label: "製造與能力", href: "/faq#manufacturing-capabilities" },
        { label: "交期與表面處理", href: "/faq#lead-time-finishing" },
        { label: "品質與合規", href: "/faq#quality-compliance" },
        { label: "運輸與報價", href: "/faq#shipping-quotation" },
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
