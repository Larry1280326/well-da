export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Company Profile", href: "/about#profile" },
      { label: "CTA", href: "/about#cta" },
      { label: "Core Value Proposition", href: "/about#core-value" },
      { label: "Trust Line", href: "/about#trust-line" },
    ],
  },
  {
    label: "Applications",
    href: "/applications",
    children: [
      { label: "Electronics", href: "/applications/electronics" },
      { label: "Automotive", href: "/applications/automotive" },
      { label: "Medical Devices", href: "/applications/medical" },
      { label: "Industrial Equipment", href: "/applications/industrial" },
    ],
  },
  {
    label: "Manufacturing Capabilities",
    href: "/manufacturing",
    children: [
      { label: "CNC Machining", href: "/manufacturing/cnc-machining" },
      { label: "Sheet Metal Fabrication", href: "/manufacturing/sheet-metal" },
      { label: "Die Casting", href: "/manufacturing/die-casting" },
      { label: "Surface Finishing", href: "/manufacturing/surface-finishing" },
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
      { label: "Custom Assemblies", href: "/case-studies/custom-assemblies" },
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
];

export const contactInfo = {
  phone: "(+852) 2790 5008",
  phoneHref: "tel:+85227905008",
  email: "eng@wellda.com",
  emailHref: "mailto:eng@wellda.com",
};
