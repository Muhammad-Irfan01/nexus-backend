import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceService } from './modules/workspace/workspace.service';
import { WorkspaceController } from './modules/workspace/workspace.controller';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { MailModule } from './modules/mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';
import { PrismaClient } from '@prisma/client';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { RagModule } from './modules/rag/rag.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';


@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true}), PrismaModule, UsersModule, AuthModule, WorkspaceModule, MailModule, DocumentsModule, EmbeddingModule, RagModule, ChatModule, AnalyticsModule, BillingModule],
  exports: [],
  controllers: [AppController, WorkspaceController],
  providers: [{provide : APP_GUARD, useClass: RolesGuard}, AppService, WorkspaceService],
})
export class AppModule {}
