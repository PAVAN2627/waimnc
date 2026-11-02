import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { R2Module } from './r2/r2.module';
import { TendersModule } from './tenders/tenders.module';
import { OfficialsModule } from './officials/officials.module';
import { GrievancesModule } from './grievances/grievances.module';
import { NoticesModule } from './notices/notices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SabhaModule } from './sabha/sabha.module';
import { ProjectsModule } from './projects/projects.module';
import { NewsModule } from './news/news.module';
import { SchemesModule } from './schemes/schemes.module';
import { GalleryModule } from './gallery/gallery.module';
import { RoutineModule } from './routine/routine.module';
import { StorageModule } from './storage/storage.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 500, // 500 requests per minute for general API
      },
    ]),
    PrismaModule,
    CacheModule,
    AuditLogsModule,
    AuthModule,
    StorageModule,
    R2Module,
    DashboardModule,
    SabhaModule,
    TendersModule,
    OfficialsModule,
    GrievancesModule,
    NoticesModule,
    ProjectsModule,
    NewsModule,
    SchemesModule,
    GalleryModule,
    RoutineModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
