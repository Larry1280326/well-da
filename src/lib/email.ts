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
