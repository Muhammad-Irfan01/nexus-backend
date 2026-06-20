import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceRole } from '@prisma/client'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkspaceService {
    constructor(private readonly prisma: PrismaService) { }

    async createWorksapce(userId: string, dto: CreateWorkspaceDto) {
        const existingWorkspace = await this.prisma.workspace.findUnique({
            where: { slug: dto.slug }
        })

        if (existingWorkspace) throw new ConflictException('Workspace already exists');

        return this.prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: { name: dto.name, slug: dto.slug, description: dto.description, createdById: userId }
            })

            await tx.workspaceMember.create({
                data: { workspaceId: workspace.id, userId, role: 'OWNER' }
            })

            await tx.workspaceSettings.create({
                data: { workspaceId: workspace.id }
            })

            return workspace;
        })
    }

    async getMyWorkspaces(userId: string) {
        return this.prisma.workspaceMember.findMany({
            where: { userId }, include: { workspace: { include: { settings: true } } }
        })
    }

    async getWorkspaceById(workspaceId: string, userId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        })

        if (!membership) throw new ForbiddenException('You are not a member of this workspace');

        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId }, include: { settings: true, members: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } } } } }
        })

        if(!workspace) throw new NotFoundException('Workspace not found');

        return workspace;
    }

    async updateWorkspace(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId : {userId, workspaceId} }
        })

        const allowedRoles: WorkspaceRole[] = [ WorkspaceRole.OWNER, WorkspaceRole.ADMIN];

        if(!membership || !allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Not Allowed');
        }

        return this.prisma.workspace.update({
            where: {id: userId}, data: dto
        })
    }

    async deleteWorkspace(workspaceId: string, userId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!membership || membership.role !== WorkspaceRole.OWNER) {
            throw new ForbiddenException('Only admin can delete workspace');
        }

        await this.prisma.workspace.delete({
            where: {id: workspaceId}
        })

        return { message: 'Workspace deleted successfully' };
    }

    async getMember(userId: string, workspaceId: string) {
        const membership =  await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {userId, workspaceId}
            }
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.workspaceMember.findMany({
            where: {id: workspaceId}, include: {user: {select: {id: true, email: true, firstName: true, lastName: true, avatar: true}} }
        })
    }

    async updateMemberRole(userId: string, workspaceId: string, memberId: string, role: UpdateMemberRoleDto) {
        const requester = await this.prisma.workspaceMember.findUnique ({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!requester || requester.role !== WorkspaceRole.OWNER) {
            throw new ForbiddenException('Only admin can update member role');
        }

        const member = await this.prisma.workspaceMember.findUnique({
            where: {id: memberId}
        })

        if(!member)  throw new NotFoundException('Member not found');

        return this.prisma.workspaceMember.update({
            where: {id: memberId}, data: {role: role.role}
        })
    }

    async removeMember(userId: string, workspaceId: string, memberId: string) {
        const requester = await this.prisma.workspaceMember.findUnique ({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        // if(!requester || requester.role !== WorkspaceRole.OWNER) {
        //     throw new ForbiddenException('Only admin can remove member');
        // }

        const member = await this.prisma.workspaceMember.findUnique({
            where: {id: memberId}
        })

        if(!member)  throw new NotFoundException('Member not found');

        const memberRole = member.role;
        if (requester?.role === WorkspaceRole.ADMIN && memberRole !== WorkspaceRole.MEMBER) {
            throw new ForbiddenException('ADMIN can only remove MEMBER');
        }

        return this.prisma.workspaceMember.delete({
            where: {id: memberId}
        })
    }

    async inviteMember(userId: string, workspaceId: string, dto: InviteMemberDto) {
        const requester =  await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!requester || (requester.role !== WorkspaceRole.ADMIN && requester.role !== WorkspaceRole.OWNER) ) {
            throw new ForbiddenException('Only admin or owner can invite member');
        }

        const token = randomBytes(32).toString('hex');

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);


        return this.prisma.workspaceInvite.create({
            data: {workspaceId, email: dto.email, token, expiresAt}
        })
    }

    async acceptInvite(userId: string, token: string) {
        const invite = await this.prisma.workspaceInvite.findUnique({
            where: {token}
        })

        if(!invite) throw new NotFoundException('Invite not found');

        if(invite.expiresAt < new Date()) {
            throw new BadRequestException('Invite expired');
        }

        const user = await this.prisma.user.findUnique({
            where: {id: userId}
        })

        if(user?.email !== invite.email) throw new NotFoundException('Invalid Email');

        return this.prisma.$transaction(async(tx) => {
            await tx.workspaceMember.create({
                data: {userId, workspaceId: invite.workspaceId, role: WorkspaceRole.MEMBER}
            })
            return tx.workspaceInvite.update({
                where: {id: invite.id}, data: {status: 'ACCEPTED'}
            })
        })
    }

    async getWorkspaceSetting(userId: string, workspaceId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.workspaceSettings.findUnique({
            where: {workspaceId}
        })
    }

    async updateWorkspaceSetting(userId: string, workspaceId: string, dto: {defaultModel?: string, allowMemberInvite: boolean}) {
        const requester = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!requester || (requester.role !== WorkspaceRole.ADMIN && requester.role !== WorkspaceRole.OWNER)) {
            throw new ForbiddenException('Only admin or owner can update workspace setting');
        }

        return this.prisma.workspaceSettings.update({
            where: {workspaceId}, data: dto
        })
    }
}
