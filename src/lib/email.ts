import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { query } from "@/lib/db";
import { confirmationEmailEn, confirmationEmailZh, type ConfirmationEmailParams } from "@/lib/email/templates";

let sesClient: SESClient | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
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

export async function sendConfirmationEmail(
  params: SendConfirmationEmailParams,
): Promise<void> {
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
  const senderEmail = process.env.AWS_SES_SENDER_EMAIL!;

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

  // Track that the confirmation email was sent
  await query(
    `UPDATE rfqs SET confirmation_email_sent = TRUE WHERE id = $1`,
    [rfqId],
  );
}
