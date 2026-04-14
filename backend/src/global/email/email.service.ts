import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private brevoClient: BrevoClient;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    // Initialize Brevo API client
    this.brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY || '',
    });

    this.senderEmail = process.env.EMAIL_FROM || 'no-reply@germanschool.rw';
    this.senderName = process.env.EMAIL_FROM_NAME || 'German School Kigali';

    if (!process.env.BREVO_API_KEY) {
      this.logger.warn('BREVO_API_KEY not found in environment variables');
    } else {
      this.logger.log('Brevo email service initialized');
    }
  }

  /**
   * Load and compile HBS template
   * @param templateName - Name of the template file (without extension)
   * @param data - Data to inject into the template
   * @returns Compiled HTML string
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

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  /**
   * Sends an email with the given subject, recipient, and dynamic template data.
   * @param to - Recipient email address (string or array)
   * @param subject - Email subject (dynamic)
   * @param templateName - Name of the handlebars template file (without extension)
   * @param templateData - Data to populate the template placeholders
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

    // Convert to array of recipient objects
    const recipients = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];

    try {
      const result = await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: { email: this.senderEmail, name: this.senderName },
        to: recipients,
        subject: subject,
        htmlContent: html,
      });
      this.logger.log(
        `Email sent to ${Array.isArray(to) ? to.join(', ') : to} with subject "${subject}" - MessageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error('Failed to send email via Brevo', error);
      throw new Error('Email sending failed');
    }
  }

}