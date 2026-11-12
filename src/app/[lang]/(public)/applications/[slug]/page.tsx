import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { productSlugs, isProductSlug } from "@/config/products";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Props = { params: Promise<{ lang: string; slug: string }> };
export function generateStaticParams() { return productSlugs.map(slug => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !isProductSlug(slug)) return {};
  const product = (await getDictionary(lang)).productPages[slug];
  return pageMetadata(lang, `/applications/${slug}`, product.seoTitle, product.description, product.image);
}
export default async function ProductPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !isProductSlug(slug)) notFound();
  const dict = await getDictionary(lang);
  const product = dict.productPages[slug];
  return <>
    <Breadcrumbs lang={lang} items={[{ name: dict.applications.pageTitle, path: "/applications" }, { name: product.title, path: `/applications/${slug}` }]} />
    <section style={{ background: "linear-gradient(180deg, #f9fbf9 0%, #fff 100%)", borderBottom: "1px solid #ececec" }}>
      <Container size="xl" py={60}>
        <Title order={1} mb="md">{product.title}</Title>
        <Text maw={800} mb="xl">{product.intro}</Text>
        <Button component="a" href={`/${lang}/quotation?source=${encodeURIComponent(`/${lang}/applications/${slug}`)}`}>{dict.about.getQuote}</Button>
      </Container>
    </section>
    <Container size="xl" py={40}>
      <figure style={{ margin: "0 0 2rem", maxWidth: 800 }}>
        <Image src={product.image} alt={product.imageAlt} width={800} height={534} sizes="(max-width: 800px) 100vw, 800px" style={{ width: "100%", height: "auto", borderRadius: 8 }} />
        <figcaption>{product.imageCaption}</figcaption>
      </figure>
      {product.sections.map(section => <section key={section.title} style={{ marginBottom: "2rem", maxWidth: 850 }}>
        <Title order={2} mb="sm">{section.title}</Title>
        <Text>{section.text}</Text>
      </section>)}
      <Group mb="xl">
        <Link href={`/${lang}/manufacturing`}>{dict.manufacturing.pageTitle}</Link>
        <Link href={`/${lang}/quality`}>{dict.quality.pageTitle}</Link>
        <Link href={`/${lang}/case-studies`}>{dict.caseStudies.pageTitle}</Link>
      </Group>
      <Title order={2} mb="sm">{dict.about.sendDrawing}</Title>
      <Text mb="md">{product.rfq}</Text>
      <Button component="a" href={`/${lang}/quotation?source=${encodeURIComponent(`/${lang}/applications/${slug}`)}`}>{dict.about.getQuote}</Button>
      <nav aria-label={dict.applications.pageTitle} style={{ marginTop: "2rem" }}>
        <ul>{productSlugs.filter(s => s !== slug).map(s => <li key={s}><Link href={`/${lang}/applications/${s}`}>{dict.productPages[s].title}</Link></li>)}</ul>
      </nav>
    </Container>
  </>;
}
