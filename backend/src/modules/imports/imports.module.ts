import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller.js';
import { ImportsService } from './imports.service.js';
import { CsvParser } from './parsers/csv.parser.js';
import { OfxParser } from './parsers/ofx.parser.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [ImportsController],
  providers: [ImportsService, CsvParser, OfxParser],
  exports: [ImportsService],
})
export class ImportsModule {}
