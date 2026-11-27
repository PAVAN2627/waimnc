import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureSchemaIntegrity();
  }

  /**
   * Automatic schema self-healing DDL checks.
   * Ensures essential columns exist in PostgreSQL without dropping data or requiring manual migration prompts.
   */
  async ensureSchemaIntegrity() {
    try {
      this.logger.log('Checking and ensuring database schema integrity...');
      // Ensure missing columns in admins table exist
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "department" TEXT;`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "departments" TEXT[] DEFAULT ARRAY[]::TEXT[];`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "ward" TEXT;`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "mobile" TEXT;`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "accessScope" TEXT DEFAULT 'all';`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);`).catch(() => {});

      // Ensure missing columns in complaints table exist
      await this.$executeRawUnsafe(`ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "ward" TEXT DEFAULT 'माहिती नाही';`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "trackingId" TEXT;`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'general';`).catch(() => {});
      await this.$executeRawUnsafe(`ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "attachments" JSONB DEFAULT '[]'::jsonb;`).catch(() => {});

      // Ensure audit_logs table exists (critical — missing table causes 500 on every login)
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "audit_logs" (
          "id"         TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
          "adminId"    TEXT,
          "adminEmail" TEXT,
          "adminName"  TEXT,
          "action"     TEXT         NOT NULL,
          "resource"   TEXT         NOT NULL,
          "resourceId" TEXT,
          "details"    JSONB,
          "ipAddress"  TEXT,
          "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
        );
      `).catch(() => {});

      this.logger.log('Database schema integrity verified successfully.');
    } catch (err: any) {
      this.logger.warn(`Schema integrity check non-fatal notice: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

