import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function stripMarkdown(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

function loadDict(locale) {
  const path = resolve(root, "src", "i18n", "dictionaries", `${locale}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
}

// Duplicate the navigation data so the build script can run without importing TS
// (navigation.ts uses TS + path aliases that don't work in bare Node).
function getNavData(locale) {
  const en = {
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
          { label: "Custom Metal Enclosures", href: "/applications#custom-metal-enclosures" },
          { label: "Electrical and Control Boxes", href: "/applications#electrical-and-control-boxes" },
          { label: "Cabinets and Lockers", href: "/applications#cabinets-and-lockers" },
          { label: "Communication Equipment Housings", href: "/applications#communication-equipment-housings" },
          { label: "Security System Hardware", href: "/applications#security-system-hardware" },
          { label: "Non-Standard Metal Products", href: "/applications#non-standard-metal-products" },
        ],
      },
      {
        label: "Manufacturing Capabilities",
        href: "/manufacturing",
        children: [
          { label: "Integrated Sheet Metal Manufacturing", href: "/manufacturing#integrated_sheet_metal" },
        ],
      },
      {
        label: "Quality & Tolerance",
        href: "/quality",
        children: [
          { label: "Quality Control", href: "/quality#control" },
        ],
      },
      {
        label: "Case Studies",
        href: "/case-studies",
        children: [
          { label: "Electrical Enclosure", href: "/case-studies#flat-sheet-to-electrical-enclosure" },
          { label: "Kiosk Enclosure", href: "/case-studies#ordering-kiosk-enclosures" },
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
  };

  const zh = {
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
          { label: "訂製金屬外殼", href: "/applications#custom-metal-enclosures" },
          { label: "電氣與控制箱", href: "/applications#electrical-and-control-boxes" },
          { label: "機櫃與儲物櫃", href: "/applications#cabinets-and-lockers" },
          { label: "通訊設備外殼", href: "/applications#communication-equipment-housings" },
          { label: "安防系統硬體", href: "/applications#security-system-hardware" },
          { label: "非標準金屬產品", href: "/applications#non-standard-metal-products" },
        ],
      },
      {
        label: "製造能力",
        href: "/manufacturing",
        children: [
          { label: "鈑金加工能力", href: "/manufacturing#integrated_sheet_metal" },
        ],
      },
      {
        label: "品質與公差",
        href: "/quality",
        children: [
          { label: "品質控制", href: "/quality#control" },
        ],
      },
      {
        label: "案例研究",
        href: "/case-studies",
        children: [
          { label: "電氣外殼", href: "/case-studies#flat-sheet-to-electrical-enclosure" },
          { label: "售貨機外殼", href: "/case-studies#ordering-kiosk-enclosures" },
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
  };

  return locale === "zh" ? zh : en;
}

let counter = 0;
function nextId() {
  return `entry-${++counter}`;
}

function generateIndex(locale) {
  counter = 0;
  const dict = loadDict(locale);
  const navData = getNavData(locale);
  const entries = [];

  // ---- Navigation pages ----
  for (const item of navData.navItems) {
    entries.push({
      id: nextId(),
      type: "page",
      title: item.label,
      text: item.label,
      href: item.href,
    });
    if (item.children) {
      for (const child of item.children) {
        entries.push({
          id: nextId(),
          type: "page",
          title: child.label,
          text: child.label,
          href: child.href,
        });
      }
    }
  }

  // ---- About ----
  if (dict.about) {
    const a = dict.about;
    entries.push(
      { id: nextId(), type: "page", title: a.profileTitle, text: `${a.profileDesc1} ${a.profileDesc2}`, href: "/about" },
      { id: nextId(), type: "page", title: a.coreTitle, text: `${a.coreDesc1} ${a.coreDesc2}`, href: "/about#core-value" },
      { id: nextId(), type: "page", title: a.trustTitle, text: stripMarkdown(a.trustDesc), href: "/about#trust-line" },
    );
  }

  // ---- Applications ----
  if (dict.applications?.sections) {
    for (const s of dict.applications.sections) {
      entries.push({
        id: nextId(),
        type: "product",
        title: s.title,
        text: s.description,
        href: `/applications#${s.slug}`,
        section: dict.applications.pageTitle,
      });
    }
  }

  // ---- Manufacturing ----
  if (dict.manufacturing?.capabilities) {
    for (const c of dict.manufacturing.capabilities) {
      entries.push({
        id: nextId(),
        type: "capability",
        title: c.label,
        text: c.label,
        href: "/manufacturing",
        section: dict.manufacturing.pageTitle,
      });
    }
    // Also index the intro text
    entries.push({
      id: nextId(),
      type: "page",
      title: dict.manufacturing.sectionTitle || dict.manufacturing.pageTitle,
      text: `${stripMarkdown(dict.manufacturing.intro || "")} ${stripMarkdown(dict.manufacturing.materials || "")}`,
      href: "/manufacturing",
    });
  }

  // ---- Quality ----
  if (dict.quality?.paragraphs) {
    entries.push({
      id: nextId(),
      type: "page",
      title: dict.quality.sectionTitle || dict.quality.pageTitle,
      text: dict.quality.paragraphs.map((p) => stripMarkdown(p)).join(" "),
      href: "/quality",
    });
  }

  // ---- Case Studies ----
  if (dict.caseStudies?.sections) {
    for (const s of dict.caseStudies.sections) {
      entries.push({
        id: nextId(),
        type: "case-study",
        title: s.title,
        text: stripMarkdown(s.description),
        href: `/case-studies#${s.slug}`,
        section: dict.caseStudies.pageTitle,
      });
    }
  }

  // ---- FAQ ----
  if (dict.faq?.sections) {
    for (const section of dict.faq.sections) {
      for (const q of section.questions) {
        entries.push({
          id: nextId(),
          type: "faq",
          title: q.question,
          text: q.answer.map((a) => stripMarkdown(a)).join(" "),
          href: `/faq#${section.slug}`,
          section: section.title,
        });
      }
      // Also index the FAQ section title
      entries.push({
        id: nextId(),
        type: "page",
        title: section.title,
        text: section.title,
        href: `/faq#${section.slug}`,
      });
    }
  }

  // ---- Quotation ----
  if (dict.quotation) {
    entries.push({
      id: nextId(),
      type: "page",
      title: dict.quotation.heading,
      text: stripMarkdown(dict.quotation.intro),
      href: "/quotation",
    });
  }

  return entries;
}

function main() {
  const publicDir = resolve(root, "public");

  for (const locale of ["en", "zh"]) {
    const entries = generateIndex(locale);
    const outPath = resolve(publicDir, `search-index-${locale}.json`);
    writeFileSync(outPath, JSON.stringify(entries, null, 2), "utf-8");
    console.log(`Wrote ${entries.length} entries to ${outPath}`);
  }
}

main();
