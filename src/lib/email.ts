import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
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

export async function sendInternalRfqNotification(
  params: InternalRfqNotificationParams,
): Promise<EmailResult> {
  const topicArn = process.env.SNS_RFQ_TOPIC_ARN;
  if (!topicArn) {
    return { sent: false, error: "SNS staff notification not configured" };
  }

  const topicParts = topicArn.split(":");
  if (topicParts.length !== 6 || topicParts[0] !== "arn" || topicParts[2] !== "sns" || !topicParts[3] || !/^\d{12}$/.test(topicParts[4]) || !topicParts[5]) {
    return { sent: false, error: "SNS staff notification topic is invalid" };
  }

  // Only a summary is delivered to the SNS topic's confirmed subscribers.
  // Customer names, email addresses, notes and drawings stay in the authenticated admin view.
  const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, " ").trim();
  const message = [
    "A new website RFQ has been saved to the Well Da database.",
    "",
    "Reference: " + params.reference,
    "Company: " + oneLine(params.companyName),
    "Project: " + oneLine(params.projectName),
    "Submitted: " + params.submittedAt,
    "Drawing files: " + params.fileCount,
    "",
    "View after signing in:",
    "https://www.wellda.com/en/administrator/rfq/" + params.rfqId,
    "",
    "Do not forward confidential drawings outside approved channels.",
  ].join("\n");

  // The Amplify SSR Compute role must have sns:Publish scoped to this topic.
  // An SNS MessageId confirms acceptance for delivery, not receipt in Henry's inbox.
  try {
    const client = new SNSClient({ region: topicParts[3] });
    const result = await client.send(new PublishCommand({
      TopicArn: topicArn,
      Subject: "New website RFQ - " + params.reference,
      Message: message,
    }), { abortSignal: AbortSignal.timeout(4500) });
    if (!result.MessageId) {
      throw new Error("SNS Publish response missing MessageId");
    }
    return { sent: true };
  } catch (err) {
    // Never log AWS credentials, topic subscribers or customer-supplied RFQ contents.
    console.error("RFQ internal notification SNS failure:", err instanceof Error ? err.name : "Unknown error");
    return { sent: false, error: "SNS staff notification failed" };
  }
}
