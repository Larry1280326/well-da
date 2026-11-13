import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { query } from "@/lib/db";
import { confirmationEmailEn, confirmationEmailZh, type ConfirmationEmailParams } from "@/lib/email/templates";

let sesClient: SESClient | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.SES_REGION,
      credentials: {
        accessKeyId: process.env.SES_ACCESS_KEY_ID!,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
      },
    });
  }
  return sesClient;
}

interface SendConfirmationEmailParams extends ConfirmationEmailParams {
  to: string;
  rfqId: number;
  lang: string;
}

export interface EmailResult {
  sent: boolean;
  error?: string;
}

export async function sendConfirmationEmail(
  params: SendConfirmationEmailParams,
): Promise<EmailResult> {
  const { to, rfqId, reference, projectName, contactName, companyName, submittedAt, lang } = params;
  if (!["SES_REGION", "SES_ACCESS_KEY_ID", "SES_SECRET_ACCESS_KEY", "SES_SENDER_EMAIL"].every(key => process.env[key])) {
    console.warn("RFQ confirmation email is not configured.");
    return { sent: false, error: lang === "zh" ? "詢價已儲存，但確認電郵服務尚未設定。" : "Your RFQ is saved, but confirmation email is not configured." };
  }

  const templateFn = lang === "zh" ? confirmationEmailZh : confirmationEmailEn;
  const { subject, html } = templateFn({
    reference,
    projectName,
    contactName,
    companyName,
    submittedAt,
  });

  const client = getSesClient();
  const senderEmail = process.env.SES_SENDER_EMAIL!;

  try {
    await client.send(
      new SendEmailCommand({
        Source: senderEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Html: { Data: html, Charset: "UTF-8" } },
        },
      }),
    );
  } catch (err) {
    const sesError = err as Error & { name?: string; $metadata?: unknown };
    console.error(
      `Confirmation email failed for RFQ ${reference}:`,
      sesError.name ?? "UnknownSESError",
    );

    // Produce a user-friendly error message
    const userError = lang === "zh" ? "詢價已儲存，但確認電郵未能寄出。如有需要，請直接聯絡我們。" : "Your RFQ is saved, but the confirmation email could not be sent. Contact us directly if needed.";

    return { sent: false, error: userError };
  }

  // Track that the confirmation email was sent
  try {
    await query(
      `UPDATE rfqs SET confirmation_email_sent = TRUE WHERE id = $1`,
      [rfqId],
    );
  } catch (dbErr) {
    console.error(
      `Failed to update confirmation_email_sent for RFQ ${reference}:`,
      dbErr,
    );
  }

  return { sent: true };
}

// Sent only after the RFQ transaction commits. Does not attach customer drawings.
export interface InternalRfqNotificationParams {
  rfqId: number;
  reference: string;
  companyName: string;
  projectName: string;
  contactName: string;
  contactEmail: string;
  submittedAt: string;
  fileCount: number;
}

const RFQ_STAFF_NOTIFICATION_RECIPIENT = "henrychoi@wellda.com";
const RFQ_STAFF_NOTIFICATION_SENDER = "eng@wellda.com";

export async function sendInternalRfqNotification(
  params: InternalRfqNotificationParams,
): Promise<EmailResult> {
  if (!["M365_TENANT_ID", "M365_CLIENT_ID", "M365_CLIENT_SECRET"].every(key => process.env[key])) {
    return { sent: false, error: "Microsoft 365 staff notification not configured" };
  }

  // Plain text: no customer-provided HTML or attachments are included in email.
  // The administrator retrieves drawings from the authenticated RFQ detail screen.
  const message = [
    "A new website RFQ has been saved to the Well Da database.",
    "",
    "Reference: " + params.reference,
    "Company: " + params.companyName,
    "Project: " + params.projectName,
    "Contact: " + params.contactName,
    "Customer email: " + params.contactEmail,
    "Submitted: " + params.submittedAt,
    "Drawing files: " + params.fileCount,
    "",
    "View after signing in:",
    "https://www.wellda.com/en/administrator/rfq/" + params.rfqId,
    "",
    "Do not forward confidential drawings outside approved channels.",
  ].join("\n");

  // App-only Graph send from the company's own Exchange Online mailbox.
  // The Exchange application RBAC role must be scoped to the eng mailbox only.
  // A 202 response means Graph accepted the request, not that Henry received it.
  try {
    const signal = AbortSignal.timeout(4500);
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(process.env.M365_TENANT_ID!)}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.M365_CLIENT_ID!,
          client_secret: process.env.M365_CLIENT_SECRET!,
          grant_type: "client_credentials",
          scope: "https://graph.microsoft.com/.default",
        }),
        signal,
        cache: "no-store",
      },
    );
    if (!tokenResponse.ok) {
      throw new Error(`Microsoft 365 token HTTP ${tokenResponse.status}`);
    }
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) {
      throw new Error("Microsoft 365 token missing access_token");
    }

    const mailResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(RFQ_STAFF_NOTIFICATION_SENDER)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: "New website RFQ - " + params.reference,
            body: { contentType: "Text", content: message },
            toRecipients: [{ emailAddress: { address: RFQ_STAFF_NOTIFICATION_RECIPIENT } }],
          },
          saveToSentItems: true,
        }),
        signal,
        cache: "no-store",
      },
    );
    if (mailResponse.status !== 202) {
      throw new Error(`Microsoft Graph sendMail HTTP ${mailResponse.status}`);
    }
    return { sent: true };
  } catch (err) {
    // Never log tokens, client secrets, or customer-supplied RFQ contents.
    console.error("RFQ internal notification Graph failure:", err instanceof Error ? err.message : "Unknown error");
    return { sent: false, error: "Microsoft 365 staff notification failed" };
  }
}
