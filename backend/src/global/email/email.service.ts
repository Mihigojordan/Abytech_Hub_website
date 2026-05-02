import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

// juice is a CommonJS module — require() gives us the callable function directly
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const juiceInline: (html: string, options?: any) => string = require('juice');

/**
 * CSS custom-property → literal hex value map.
 * Email clients (Gmail, Outlook, Apple Mail) strip CSS variables, so every
 * var(--*) reference must be replaced with its actual value before sending.
 */
const CSS_VARS: [string, string][] = [
  ['var(--ink)',      '#0E1A24'],
  ['var(--ink-2)',    '#132332'],
  ['var(--ink-3)',    '#1B2C3D'],
  ['var(--orange)',   '#E85A1C'],
  ['var(--orange-2)', '#D04E16'],
  ['var(--teal)',     '#2C6C86'],
  ['var(--grey)',     '#5A6670'],
  ['var(--grey-2)',   '#8A949E'],
  ['var(--line)',     '#E3E6EA'],
  ['var(--paper)',    '#F4F2EE'],
  ['var(--card)',     '#FFFFFF'],
];

/** Replace all CSS variable references with literal hex values (simple string replace, no regex). */
function resolveCssVars(html: string): string {
  let result = html;
  for (const [varName, hexValue] of CSS_VARS) {
    // Use split/join to do a global string replace without regex
    result = result.split(varName).join(hexValue);
  }
  return result;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private brevoClient: BrevoClient;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY || '',
    });

    this.senderEmail = process.env.EMAIL_FROM || 'no-reply@abytechhub.com';
    this.senderName  = process.env.EMAIL_FROM_NAME || 'AbyTech Hub';

    if (!process.env.BREVO_API_KEY) {
      this.logger.warn('BREVO_API_KEY not found in environment variables');
    } else {
      this.logger.log('Brevo email service initialized');
    }
  }

  /**
   * Load, compile and fully inline an HBS email template.
   *
   * Pipeline:
   *  1. Read the .hbs file from disk
   *  2. Replace all CSS custom-property references (var(--*)) with literal hex
   *     values — email clients do NOT support CSS variables.
   *  3. Compile the Handlebars template with the supplied data
   *  4. Run `juice` to inline every <style> rule into matching elements as
   *     style="" attributes — the only reliable way to style HTML email.
   */
  private loadTemplate(templateName: string, data: Record<string, any>): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'Templates',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      this.logger.error(
        `Email template "${templateName}" not found at ${templatePath}`,
      );
      throw new BadRequestException('Email template not found');
    }

    // 1. Read raw template source
    const rawSource = fs.readFileSync(templatePath, 'utf-8');

    // 2. Resolve CSS variables → literal hex values
    const resolvedSource = resolveCssVars(rawSource);

    // 3. Compile Handlebars template
    const template = handlebars.compile(resolvedSource);
    const compiledHtml = template(data);

    // 4. Inline all <style> rules into element style="" attributes
    const inlinedHtml = juiceInline(compiledHtml, {
      preserveMediaQueries: true,
      preserveFontFaces: true,
      preserveKeyFrames: true,
      removeStyleTags: true,
      applyStyleTags: true,
    });

    return inlinedHtml;
  }

  /**
   * Send a transactional email via Brevo.
   *
   * @param to            Recipient address or array of addresses
   * @param subject       Email subject line
   * @param templateName  HBS template filename (without .hbs extension)
   * @param templateData  Variables injected into the template
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ): Promise<void> {
    if (!to || !subject || !templateName) {
      throw new BadRequestException(
        'Email recipient, subject and template are required.',
      );
    }

    const html = this.loadTemplate(templateName, templateData);

    const recipients = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];

    try {
      const result = await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: { email: this.senderEmail, name: this.senderName },
        to: recipients,
        subject,
        htmlContent: html,
      });
      this.logger.log(
        `Email sent to ${Array.isArray(to) ? to.join(', ') : to} — subject: "${subject}" — messageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error('Failed to send email via Brevo', error);
      throw new Error('Email sending failed');
    }
  }
}
