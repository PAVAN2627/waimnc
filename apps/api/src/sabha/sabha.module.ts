import { Module } from '@nestjs/common';
import { SabhaService } from './sabha.service';
import { SabhaController } from './sabha.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [SabhaController],
  providers: [SabhaService],
  exports: [SabhaService],
})
export class SabhaModule {}
