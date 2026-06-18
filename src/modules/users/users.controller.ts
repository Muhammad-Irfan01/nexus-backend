import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
@Controller('users')
@UseGuards( JwtAuthGuard)
export class UsersController {

    constructor( private readonly userservice: UsersService) {}

    @Get('profile')
    getProfile( @CurrentUser() user: any) {
        return this.userservice.getProfile(user.sub);
    }

    @Patch('profile')
    updateProfile( @CurrentUser() user, @Body() dto: UpdateProfileDto) {
        return this.userservice.updateProfile(user.sub, dto);
    }

    @Patch('change-password')
    changePassword( @CurrentUser() user, @Body() dto: ChangePasswordDto) {
        return this.userservice.changePassword(user.sub, dto);
    }

    @Delete('account')
    deleteAccount( @CurrentUser() user) {
        return this.userservice.deleteAccount(user.sub);
    }

    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseGuards( RolesGuard)
    getUsers() {
        return this.userservice.getAllUsers();
    }

    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseGuards( RolesGuard)
    getUserById( @Param('id') id: string) {
        return this.userservice.getUserById(id);
    }

    @Patch(':id/role')
    @Roles('SUPER_ADMIN')
    @UseGuards( RolesGuard)
    updateRole( @Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.userservice.UpdateRole(id, dto);
    }
}
