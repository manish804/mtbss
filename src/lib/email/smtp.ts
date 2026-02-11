import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedConfigKey: string | null = null;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);

  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!from) missing.push("SMTP_FROM or SMTP_USER");
  if (!Number.isFinite(port) || port <= 0) missing.push("valid SMTP_PORT");

  if (missing.length > 0) {
    throw new Error(
      `SMTP configuration is incomplete. Missing: ${missing.join(", ")}`
    );
  }

  const validatedHost = host as string;
  const validatedUser = user as string;
  const validatedPass = pass as string;
  const validatedFrom = from as string;

  return {
    host: validatedHost,
    port,
    secure,
    user: validatedUser,
    pass: validatedPass,
    from: validatedFrom,
  };
}

function getTransporter(config: SmtpConfig): nodemailer.Transporter {
  const configKey = `${config.host}:${config.port}:${config.user}:${config.secure}`;
  if (cachedTransporter && cachedConfigKey === configKey) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
  });
  cachedConfigKey = configKey;

  return cachedTransporter;
}

export function parseRecipientList(...values: Array<string | undefined>): string[] {
  return values
    .flatMap((value) =>
      (value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
    .filter((email, index, arr) => arr.indexOf(email) === index);
}

export async function sendSmtpMail(input: SendMailInput): Promise<{ messageId: string }> {
  const config = getSmtpConfig();
  const transporter = getTransporter(config);

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (recipients.length === 0) {
    throw new Error("At least one recipient is required");
  }

  const result = await transporter.sendMail({
    from: config.from,
    to: recipients.join(", "),
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  });

  return { messageId: result.messageId };
}

export async function verifySmtpConnection(): Promise<void> {
  const config = getSmtpConfig();
  const transporter = getTransporter(config);
  await transporter.verify();
}
