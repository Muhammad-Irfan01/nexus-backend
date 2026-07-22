import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get(':workspaceId/keys')
  async getApiKeys(@Param('workspaceId') workspaceId: string) {
    return this.cryptoService.getApiKeys(workspaceId);
  }

  @Post(':workspaceId/keys')
  async createApiKey(@Param('workspaceId') workspaceId: string, @Body('name') name: string) {
    return this.cryptoService.createApiKey(workspaceId, name);
  }

  @Delete(':workspaceId/keys/:id')
  async deleteApiKey(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.cryptoService.deleteApiKey(id, workspaceId);
  }

  @Get(':workspaceId/protocols')
  async getAccessProtocols(@Param('workspaceId') workspaceId: string) {
    return this.cryptoService.getAccessProtocols(workspaceId);
  }

  @Post(':workspaceId/protocols')
  async createAccessProtocol(@Param('workspaceId') workspaceId: string, @Body() body: { name: string, configuration: any }) {
    return this.cryptoService.createAccessProtocol(workspaceId, body.name, body.configuration);
  }

  @Delete(':workspaceId/protocols/:id')
  async deleteAccessProtocol(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.cryptoService.deleteAccessProtocol(id, workspaceId);
  }
}
