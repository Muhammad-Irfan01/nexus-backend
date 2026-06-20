import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../../prisma/prisma.service";
import { Observable } from "rxjs";
import { WorkspaceRole } from "@prisma/client";
import { WORKSPACE_ROLES_KEY } from "../decorators/workspace-roles.decorator";


@Injectable()
export class workspaceRoleGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext):  Promise<boolean>{
        const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(WORKSPACE_ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles) return true;

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;
    const workspaceId =
      request.params.id;

    if (!workspaceId) {
      throw new ForbiddenException(
        'Workspace ID missing',
      );
    }

    const member =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.sub,
            workspaceId,
          },
        },
      });

    if (!member) {
      throw new ForbiddenException(
        'No workspace access',
      );
    }

    const allowed =
      requiredRoles.includes(member.role);

    if (!allowed) {
      throw new ForbiddenException(
        'Insufficient workspace permissions',
      );
    }

    request.workspaceRole = member.role;

    return true;
  
    }
}