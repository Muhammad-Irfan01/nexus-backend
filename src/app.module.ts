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

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true}), PrismaModule, UsersModule, AuthModule, WorkspaceModule, MailModule],
  exports: [],
  controllers: [AppController, WorkspaceController],
  providers: [{provide : APP_GUARD, useClass: RolesGuard}, AppService, WorkspaceService],
})
export class AppModule {}
