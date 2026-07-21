import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getNavItems } from "../src/config/navigation";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

function loadDict(locale: string) {
  const path = resolve(root, "src", "i18n", "dictionaries", `${locale}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
}

let counter = 0;
function nextId() {
  return `entry-${++counter}`;
}

interface SearchEntry {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
  section?: string;
}

function generateIndex(locale: "en" | "zh"): SearchEntry[] {
  counter = 0;
  const dict = loadDict(locale);
  const navData = getNavItems(locale);
  const entries: SearchEntry[] = [];

  // ---- Navigation pages ----
  for (const item of navData) {
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
    const mfgIntro = [
      stripMarkdown(dict.manufacturing.intro || ""),
      stripMarkdown(dict.manufacturing.materials || ""),
    ].filter(Boolean).join(" ");
    if (mfgIntro) {
      entries.push({
        id: nextId(),
        type: "page",
        title: dict.manufacturing.sectionTitle || dict.manufacturing.pageTitle,
        text: mfgIntro,
        href: "/manufacturing",
      });
    }
  }

  // ---- Quality ----
  if (dict.quality?.paragraphs) {
    const qualityText = dict.quality.paragraphs.map((p: string) => stripMarkdown(p)).join(" ");
    entries.push({
      id: nextId(),
      type: "page",
      title: dict.quality.sectionTitle || dict.quality.pageTitle,
      text: qualityText,
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
          text: q.answer.map((a: string) => stripMarkdown(a)).join(" "),
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
    const quoteText = [
      stripMarkdown(dict.quotation.intro || ""),
    ].filter(Boolean).join(" ");
    entries.push({
      id: nextId(),
      type: "page",
      title: dict.quotation.heading || dict.quotation.pageTitle,
      text: quoteText,
      href: "/quotation",
    });
  }

  return entries;
}

function main() {
  const publicDir = resolve(root, "public");

  for (const locale of ["en", "zh"] as const) {
    const entries = generateIndex(locale);
    const outPath = resolve(publicDir, `search-index-${locale}.json`);
    writeFileSync(outPath, JSON.stringify(entries, null, 2), "utf-8");
    console.log(`Wrote ${entries.length} entries to ${outPath}`);
  }
}

main();
