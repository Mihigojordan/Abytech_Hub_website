// src/cloudinary/cloudinary.controller.ts
import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(file.path);
  }
  @Post('secret')

  async secret() {
    return this.cloudinaryService.getPublicIdFromUrl('https://res.cloudinary.com/mycloud/image/upload/v1234567890/abytech/report/myimage.jpg');
  }

  @Delete('delete')
  async deleteImage(@Body('publicId') publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
