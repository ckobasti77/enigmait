'use server';

import nodemailer from 'nodemailer';

import {
  CONTACT_INTEREST_LABELS,
  CONTACT_INTERESTS_FIELD,
} from '@/constants/contactInterests';

type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const requiredEnv = [
  'CONTACT_SMTP_HOST',
  'CONTACT_SMTP_PORT',
  'CONTACT_SMTP_USER',
  'CONTACT_SMTP_PASS',
  'CONTACT_EMAIL_FROM',
];

function getMissingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function parsePort(value: string | undefined) {
  if (!value) return undefined;
  const port = Number.parseInt(value, 10);
  return Number.isNaN(port) ? undefined : port;
}

function formatSendError(error: unknown) {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return 'Trenutno nije moguće poslati poruku.';

  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && code.length > 0) {
      return `Email send failed (${code}): ${error.message}`;
    }
    return `Email send failed: ${error.message}`;
  }

  return 'Trenutno nije moguće poslati poruku.';
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    const missing = getMissingEnv();
    if (missing.length > 0) {
      return {
        status: 'error',
        message: `Missing email configuration: ${missing.join(', ')}`,
      };
    }

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const company = String(formData.get('company') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const responseStyle = String(formData.get('responseStyle') ?? '').trim();
    /* The pills are optional and anyone can post anything, so what arrives is
       filtered against the known values and mailed as the label the sender
       actually saw - never as the raw value. */
    const interests = formData
      .getAll(CONTACT_INTERESTS_FIELD)
      .map((value) => String(value))
      .filter((value) => value in CONTACT_INTEREST_LABELS)
      .map((value) => CONTACT_INTEREST_LABELS[value]);
    const interestsLine = interests.join(', ');

    if (!name || !email || !message) {
      return {
        status: 'error',
        message: 'Ime, e-pošta i poruka su obavezni.',
      };
    }

    if (!email.includes('@')) {
      return {
        status: 'error',
        message: 'Unesite važeću adresu e-pošte.',
      };
    }

    const port = parsePort(process.env.CONTACT_SMTP_PORT);
    if (!port) {
      return {
        status: 'error',
        message: 'CONTACT_SMTP_PORT mora biti važeći broj.',
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.CONTACT_SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.CONTACT_SMTP_USER,
        pass: process.env.CONTACT_SMTP_PASS,
      },
    });

    const to = process.env.CONTACT_EMAIL_TO ?? 'jovanm028@gmail.com';
    const fromName = process.env.CONTACT_EMAIL_FROM_NAME ?? 'Enigma Digital';
    const from = `${fromName} <${process.env.CONTACT_EMAIL_FROM}>`;

    if (process.env.CONTACT_EMAIL_FROM !== process.env.CONTACT_SMTP_USER) {
      return {
        status: 'error',
        message: 'CONTACT_EMAIL_FROM mora da se poklapa sa CONTACT_SMTP_USER za Gmail SMTP.',
      };
    }

    await transporter.verify();

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        company ? `Company: ${company}` : 'Company: (not provided)',
        interestsLine ? `Interests: ${interestsLine}` : 'Interests: (not selected)',
        responseStyle ? `Response style: ${responseStyle}` : 'Response style: (not provided)',
        '',
        'Message:',
        message,
      ].join('\n'),
      html: [
        `<p><strong>Name:</strong> ${name}</p>`,
        `<p><strong>Email:</strong> ${email}</p>`,
        `<p><strong>Company:</strong> ${company || 'Not provided'}</p>`,
        `<p><strong>Interests:</strong> ${interestsLine || 'Not selected'}</p>`,
        `<p><strong>Response style:</strong> ${responseStyle || 'Not provided'}</p>`,
        '<p><strong>Message:</strong></p>',
        `<p>${message.replace(/\n/g, '<br />')}</p>`,
      ].join(''),
    });

    return {
      status: 'success',
      message: 'Hvala! Vaša poruka je poslata.',
    };
  } catch (error) {
    console.error('Contact form error', error);
    return {
      status: 'error',
      message: formatSendError(error),
    };
  }
}
