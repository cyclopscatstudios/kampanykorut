import { createTransport } from "nodemailer";
import type { MailConfig } from "../../config/env";

const SMTP_TIMEOUT_MS = 15_000;

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}

export interface Mailer {
  send(mail: OutgoingMail): Promise<{ messageId: string | null }>;
  verify(): Promise<void>;
  close?(): void;
}

export class SmtpMailer implements Mailer {
  private readonly transport;
  private readonly from;

  constructor(config: MailConfig) {
    this.transport = createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: { user: config.user, pass: config.password },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });
    this.from = { name: config.fromName, address: config.user };
  }

  async send(mail: OutgoingMail) {
    const info = await this.transport.sendMail({
      from: this.from,
      replyTo: this.from.address,
      ...mail,
    });
    return { messageId: info.messageId ?? null };
  }

  async verify() {
    await this.transport.verify();
  }

  close() {
    this.transport.close();
  }
}
