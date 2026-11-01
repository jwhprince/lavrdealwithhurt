import nodemailer from "nodemailer";
import type { Lead, LeadEnvironment } from "./leads";

export async function sendLead(lead: Lead, env: LeadEnvironment): Promise<boolean> {
  const required = [env.SMTP_HOST, env.SMTP_PORT, env.SMTP_USER, env.SMTP_PASS, env.MAIL_FROM, env.LEADS_EMAIL];
  if (required.some(value => !value) || !["true", "false"].includes(env.SMTP_SECURE || "")) return false;
  const port = Number(env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return false;
  // Exactly one recipient and a fixed, plain mailbox sender; user input never enters headers.
  const mailbox = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
  if (!mailbox.test(env.MAIL_FROM!) || !mailbox.test(env.LEADS_EMAIL!)) return false;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port, secure: env.SMTP_SECURE === "true", requireTLS: env.SMTP_SECURE !== "true",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    logger: false, debug: false,
  });
  const labels: Record<string, string> = { sport: "Танцевальный спорт", baby: "Baby-dance", latina: "Латина" };
  try {
    const result = await transport.sendMail({
      from: env.MAIL_FROM, to: env.LEADS_EMAIL, subject: "VOLTA — заявка на пробное занятие",
      text: `Имя: ${lead.name}\nТелефон: ${lead.phone}\nНаправление: ${labels[lead.direction] || "Не выбрано"}\nСогласие на обработку данных: получено\nДата: ${new Date().toISOString()}`,
      disableFileAccess: true, disableUrlAccess: true,
    });
    return result.accepted.some((address: string | { address: string }) => (typeof address === "string" ? address : address.address).toLowerCase() === env.LEADS_EMAIL!.toLowerCase());
  } finally { transport.close(); }
}
