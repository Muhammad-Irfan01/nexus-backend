import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
    constructor( private readonly prisma: PrismaService) {}

    async getProfile (userId: string) {
        return this.prisma.user.findUnique({
            where: {id: userId, deletedAt: null},
            include: { preferences: true}
        })
    }

    async updateProfile (userId: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: {id: userId}, data: dto
        })
    }

    async changePassword (userId: string, dto: ChangePasswordDto) {
        const user =await this.prisma.user.findUnique({
            where: {id: userId}
        })

        if(!user) throw new UnauthorizedException('User not found')

        const isValid = await bcrypt.compare(dto.password, user.password);

        if (!isValid ){throw new ForbiddenException('Current Password Incorrect')}

        const hash = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: {id: userId}, data: {password: hash}
        })

        return {message: 'Password changed successfully'};
    }

    async uploadAvatar (userId: string, avatar: string) {
        return this.prisma.user.update({
            where: {id: userId}, data: {avatar}
        })
    }

    async deleteAccount (userId: string) {
        await this.prisma.user.update ({
            where: {id: userId}, data: {deletedAt: new Date()}
        })

        return {message: 'Account deleted successfully'}
    }

    async getAllUsers () {
        return this.prisma.user.findMany({
            where: {deletedAt: null}, select: {id: true, email: true, firstName: true, lastName: true, createdAt: true}
        })
    }

    async getUserById (userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId, deletedAt: null}
        })

        if(!user) throw new ForbiddenException('User not found');

        return user;
    }

    async UpdateRole (userId: string, dto: UpdateRoleDto) {
        return this.prisma.user.update({
            where: {id: userId}, data: {role: dto.role}
        })
    }
}
