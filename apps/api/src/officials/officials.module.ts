import { Module } from '@nestjs/common';
import { OfficialsService } from './officials.service';
import { OfficialsController } from './officials.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [OfficialsController],
  providers: [OfficialsService],
  exports: [OfficialsService],
})
export class OfficialsModule {}
