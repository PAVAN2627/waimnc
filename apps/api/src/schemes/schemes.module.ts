import { Module } from '@nestjs/common';
import { SchemesController } from './schemes.controller';
import { SchemesService } from './schemes.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [SchemesController],
  providers: [SchemesService],
  exports: [SchemesService],
})
export class SchemesModule {}

