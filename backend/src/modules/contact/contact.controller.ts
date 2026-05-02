import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async send(
    @Body() body: { name: string; email: string; message: string },
  ) {
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw new BadRequestException('Name, email, and message are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email address.');
    }

    return this.contactService.sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });
  }
}
