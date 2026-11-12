import Link from "next/link";
import { Container } from "@mantine/core";
import { SITE_URL } from "@/config/site";

export function Breadcrumbs({ lang, items }: { lang: string; items: { name: string; path: string }[] }) {
  const crumbs = [{ name: lang === "zh" ? "首頁" : "Home", path: "" }, ...items];
  return <Container size="xl" pt="lg">
    <nav aria-label={lang === "zh" ? "麵包屑導覽" : "Breadcrumb"}>
      <ol style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: 0, margin: 0, listStyle: "none" }}>
        {crumbs.map((item, i) => <li key={item.path}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {i === crumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={`/${lang}${item.path}`}>{item.name}</Link>}
        </li>)}
      </ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: crumbs.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE_URL}/${lang}${item.path}` })),
    }).replace(/</g, "\\u003c") }} />
  </Container>;
}
