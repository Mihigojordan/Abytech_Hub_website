import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/global/email/email.service';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async sendContactEmail(data: { name: string; email: string; message: string }) {
    const year = new Date().getFullYear().toString();
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const recipientEmail = process.env.EMAIL_FROM || 'info@abytechhub.com';

    await this.emailService.sendEmail(
      recipientEmail,
      `New Contact Message from ${data.name}`,
      'Contact-us-notification',
      {
        name: data.name,
        email: data.email,
        message: data.message,
        date,
        year,
      },
    );

    return { success: true, message: 'Your message has been sent successfully.' };
  }
}
