// src/cloudinary/cloudinary.service.ts
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { cloudinary } from './cloudinary.config';
import fs from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class CloudinaryService {
  async uploadImage(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('File not found');
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'abytech/report',
        resource_type: 'raw',
        type: 'upload', 
      });

      await unlink(filePath); // remove local file after upload

      return result;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getPublicIdFromUrl(url: string): string {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(\w+)$/);
      if (!match || match.length < 2) {
        throw new Error('Invalid Cloudinary URL');
      }
      return match[1]; // folder/subfolder/filename
    } catch (error: any) {
      throw new Error(`Failed to extract public_id: ${error.message}`);
    }
  }

  async deleteImage(publicId: string) {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
