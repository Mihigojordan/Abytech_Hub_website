import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';

@Module({
  controllers: [ResearchController],
  providers: [
    ResearchService,
    PrismaService,
    CloudinaryService,
  ],
  exports: [ResearchService],
})
export class ResearchModule {}
