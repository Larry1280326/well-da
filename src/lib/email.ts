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
      `Confirmation email failed for RFQ ${reference} (to: ${to}):`,
      sesError.name ?? "UnknownSESError",
      sesError.message,
    );

    // Produce a user-friendly error message
    let userError: string;
    if (sesError.name === "MessageRejected") {
      userError = `Email could not be delivered to ${to}. ${sesError.message}`;
    } else if (sesError.name === "MailFromDomainNotVerified") {
      userError = "Sender email domain is not verified in SES.";
    } else if (sesError.name === "ConfigurationSetDoesNotExist") {
      userError = "SES configuration error. Please contact support.";
    } else {
      userError = "Failed to send confirmation email. Please contact us directly.";
    }

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
