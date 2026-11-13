import { notFound } from "next/navigation";
import { Container, Stack, Title, Text, Anchor } from "@mantine/core";
import { pageMetadata } from "@/lib/seo";
import { hasLocale } from "@/i18n/dictionaries";

const COPY = {"en":{"title":"RFQ Data Collection & Privacy Notice","description":"How Well Da Metal Factory Limited uses contact details, specifications and drawings submitted for a quotation.","intro":"This notice explains how Well Da Metal Factory Limited handles the information and files submitted through the Request for Quotation (RFQ) form on this website.","sections":[{"heading":"Information collected","body":"The RFQ form collects company and contact details (including a name and email address), project specifications, quantities, delivery information, optional contact details and messages, and any uploaded drawings or documents. It also records the website page where the enquiry originated."},{"heading":"Purpose of collection","body":"We use these details to receive and assess your enquiry, review manufacturing feasibility, prepare or discuss a quotation, and communicate with you about the requested project. Submitting an RFQ does not automatically subscribe you to marketing email."},{"heading":"Providing information","body":"Providing an enquiry is voluntary. Fields marked as required are needed to process the RFQ. If you do not supply sufficient details, we may be unable to assess the project or reply."},{"heading":"People and services involved","body":"RFQ information may be accessed by authorised Well Da sales, engineering and administrative staff handling the enquiry and processed by service providers used for website hosting, database storage, file storage and related email delivery, including Amazon Web Services. Processing or access may take place outside your country or region."},{"heading":"Storage and enquiries about retention","body":"RFQ records are stored in a database, and submitted files in cloud object storage. Drawings are accessed through the authenticated staff RFQ area. A fixed public retention period has not yet been specified; contact us with retention or deletion enquiries. Please avoid including unnecessary personal data in drawings or notes."},{"heading":"Access, correction and contact","body":"For questions about handling your RFQ data or to request access to or correction of your personal data, contact Well Da Metal Factory Limited at eng@wellda.com. We may need to verify your identity before acting on a request."}],"contact":"Privacy enquiries: eng@wellda.com","scope":"This notice concerns information submitted through our RFQ form; it does not purport to describe every other website service."},"zh":{"title":"詢價資料收集及私隱告知","description":"滙達五金廠如何處理網站詢價表格收集的聯絡資料、技術規格及圖紙。","intro":"本告知說明滙達五金廠（Well Da Metal Factory Limited）如何處理您透過本網站詢價（RFQ）表格提供的資料及檔案。","sections":[{"heading":"收集哪些資料","body":"詢價表格會收集公司及聯絡資料（包括姓名和電郵地址）、項目規格、數量、交付資料、您選擇提供的其他聯絡方式與備註，以及上傳的圖紙或文件。系統亦會記錄詢價所來自的網站頁面。"},{"heading":"收集用途","body":"我們使用這些資料接收及評估詢價、檢視生產可行性、準備或討論報價，以及就相關項目與您聯絡。提交詢價並不代表自動訂閱推廣電郵。"},{"heading":"提供資料是否必須","body":"提交詢價屬自願性質。表格標示為必填的欄位是處理詢價所需；若資料不足，我們可能無法評估項目或作出回覆。"},{"heading":"資料接收者及服務供應商","body":"負責處理詢價的滙達銷售、工程及行政人員可能存取相關資料。網站託管、資料庫、檔案儲存及相關電郵傳送亦會使用服務供應商，包括 Amazon Web Services。資料可能在您所在國家或地區以外處理或被存取。"},{"heading":"儲存及保留查詢","body":"詢價記錄存放於資料庫，提交的檔案存放於雲端物件儲存服務。職員須透過已登入的詢價後台存取圖紙。目前尚未公布固定的資料保留期限；如欲查詢保留或刪除安排，請與我們聯絡。請避免在圖紙或備註內提供與詢價無關的個人資料。"},{"heading":"查閱、更正及聯絡","body":"如對詢價資料的處理有疑問，或希望查閱、更正您的個人資料，可電郵 eng@wellda.com 聯絡滙達五金廠（Well Da Metal Factory Limited）。處理要求前，我們可能需要核實您的身分。"}],"contact":"私隱資料查詢：eng@wellda.com","scope":"本告知針對網站詢價表格所提交的資料，並不涵蓋網站所有其他服務。"}} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = COPY[lang];
  return pageMetadata(lang, "/privacy", c.title, c.description);
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = COPY[lang];
  return (
    <Container size="md" py={64}>
      <Stack gap="lg">
        <Title order={1}>{c.title}</Title>
        <Text>{c.intro}</Text>
        {c.sections.map((section) => (
          <section key={section.heading}>
            <Title order={2} size="h3" mb="sm">{section.heading}</Title>
            <Text>{section.body}</Text>
          </section>
        ))}
        <Text><Anchor href="mailto:eng@wellda.com">{c.contact}</Anchor></Text>
        <Text size="sm" c="dimmed">{c.scope}</Text>
      </Stack>
    </Container>
  );
}
