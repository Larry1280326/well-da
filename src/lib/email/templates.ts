export interface ConfirmationEmailParams {
  reference: string;
  projectName: string;
  contactName: string;
  companyName: string;
  submittedAt: string; // YYYY-MM-DD
}

function wrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e5e7;padding:40px 48px;">
          <tr>
            <td style="padding-bottom:32px;border-bottom:2px solid #2b8a3e;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#2b8a3e;">WELL DA FACTORY LIMITED</p>
              <p style="margin:4px 0 0;font-size:13px;color:#868e96;">Precision Sheet Metal Manufacturing Since 1992</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;padding-bottom:12px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid #e9ecef;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top:16px;font-size:13px;color:#868e96;line-height:1.6;">
                    <p style="margin:0 0 4px;font-weight:600;color:#495057;">Contact Us</p>
                    <p style="margin:0;">&#x2706; (+852) 6151 5732&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://wa.me/85261515732" style="color:#2b8a3e;text-decoration:none;">WhatsApp</a></p>
                    <p style="margin:0;"><a href="mailto:eng@wellda.com" style="color:#2b8a3e;text-decoration:none;">eng@wellda.com</a></p>
                    <p style="margin:8px 0 0;color:#adb5bd;">This is an automated acknowledgement from Well Da Factory Limited.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function confirmationEmailEn(
  params: ConfirmationEmailParams,
): { subject: string; html: string } {
  const { reference, projectName, contactName, companyName, submittedAt } = params;

  const subject = `Your RFQ Has Been Received — ${reference}`;

  const body = `<h2 style="margin:0 0 16px;font-size:22px;color:#212529;">RFQ Acknowledgement</h2>
<p style="margin:0 0 24px;font-size:15px;color:#495057;line-height:1.6;">
  Dear ${escapeHtml(contactName)},<br><br>
  Thank you for submitting your RFQ to Well Da Factory Limited. We have received your enquiry and will review your specifications. We normally acknowledge RFQs within <strong>one business day</strong>. Quotation lead time depends on project complexity and information completeness.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;border:1px solid #e2e5e7;padding:20px 24px;margin-bottom:16px;">
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;width:140px;">RFQ Reference</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;font-weight:700;">${escapeHtml(reference)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">Project Name</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(projectName)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">Company</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(companyName)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">Submitted On</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(submittedAt)}</td>
  </tr>
</table>
<p style="margin:0;font-size:14px;color:#868e96;">
  Please quote your RFQ reference number <strong style="color:#212529;">${escapeHtml(reference)}</strong> in any follow-up communication.
</p>`;

  return { subject, html: wrapper(body) };
}

export function confirmationEmailZh(
  params: ConfirmationEmailParams,
): { subject: string; html: string } {
  const { reference, projectName, contactName, companyName, submittedAt } = params;

  const subject = `已收到您的詢價申請 — ${reference}`;

  const body = `<h2 style="margin:0 0 16px;font-size:22px;color:#212529;">詢價確認通知</h2>
<p style="margin:0 0 24px;font-size:15px;color:#495057;line-height:1.6;">
  ${escapeHtml(contactName)} 您好，<br><br>
  感謝您向 Well Da Factory Limited 提交詢價申請。我們已收到您的詢價，並將進行技術審核。我們通常會在 <strong>一個工作日內</strong> 確認收悉。報價週期取決於項目的複雜程度及資料的完整性。
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;border:1px solid #e2e5e7;padding:20px 24px;margin-bottom:16px;">
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;width:140px;">詢價編號</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;font-weight:700;">${escapeHtml(reference)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">項目名稱</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(projectName)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">公司名稱</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(companyName)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;padding:6px 0;color:#868e96;">提交日期</td>
    <td style="font-size:14px;padding:6px 0;color:#212529;">${escapeHtml(submittedAt)}</td>
  </tr>
</table>
<p style="margin:0;font-size:14px;color:#868e96;">
  在後續溝通中，請引用您的詢價編號 <strong style="color:#212529;">${escapeHtml(reference)}</strong>。
</p>`;

  return { subject, html: wrapper(body) };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
