import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";


@Injectable()
export class UsageTrackerService {
    constructor (private readonly prisma: PrismaService) {}

    async track( userId: string, workspaceId: string, eventType: string, metadata: any) {
        await this.prisma.usageEvent.create({
            data: {
                userId,
                workspaceId,
                eventType,
                metadata
            }
        })
    }
}
