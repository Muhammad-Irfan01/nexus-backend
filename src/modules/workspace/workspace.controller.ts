import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor (private readonly workspaceservice: WorkspaceService) {}

    @Post()
    createWorkspace( @CurrentUser() user, @Body() dto: CreateWorkspaceDto) {
        return this.workspaceservice.createWorksapce(user.sub, dto);
    }

    @Get()
    getMyWorkspaces( @CurrentUser() user) {
        return this.workspaceservice.getMyWorkspaces(user.sub);
    }

    @Get(':id')
    getWorkspaceById( @CurrentUser() user, @Param('id') workspaceId: string) {
        return this.workspaceservice.getWorkspaceById(workspaceId, user.sub);
    }

    @Patch(':id')
    updateWorkspace( @CurrentUser() user, @Param('id') workspaceId: string, @Body() dto: UpdateWorkspaceDto) {
        return this.workspaceservice.updateWorkspace(workspaceId, user.sub, dto);
    }

    @Delete(':id')
    deleteWorkspace( @CurrentUser() user, @Param('id') workspaceId: string) {
        return this.workspaceservice.deleteWorkspace(workspaceId, user.sub);
    }

    @Get(':id/members')
    getMembers( @CurrentUser() user, @Param('id') workspaceId: string) {
        return this.workspaceservice.getMember(user.sub, workspaceId);
    }

    @Patch(':id/members/:memberId')
    updateMemberRole( @CurrentUser() user, @Param('id') workspaceId: string, @Param('memberId') memberId: string, @Body() role: UpdateMemberRoleDto) {
        return this.workspaceservice.updateMemberRole(user.sub, workspaceId, memberId, role);
    }

    @Delete(':id/members/:memberId')
    removeMember( @CurrentUser() user, @Param('id') workspaceId: string, @Param('memberId') memberId: string) {
        return this.workspaceservice.removeMember(user.sub, workspaceId, memberId);
    }

    @Post(':id/invite')
    inviteMember( @CurrentUser() user, @Param('id') workspaceId: string, @Body() dto: InviteMemberDto) {
        return this.workspaceservice.inviteMember(user.sub, workspaceId, dto);
    }

    @Post('accept-invite/:token')
    acceptInvite(@CurrentUser() user, @Param('token') token: string) {
        return this.workspaceservice.acceptInvite(user.sub, token);
    }

    @Get(':id/settings')
    getworkspaceSetting( @CurrentUser() user, @Param('id') workspaceId: string) {
        return this.workspaceservice.getWorkspaceSetting(user.sub, workspaceId)
    }

    @Patch(':id/settings')
    updateWorkspaceSetting( @CurrentUser() user, @Param('id') workspaceId: string, @Body() dto: {defaultModel?: string, allowMemberInvite: boolean}) {
        return this.workspaceservice.updateWorkspaceSetting(user.sub, workspaceId, dto);
    }
}
