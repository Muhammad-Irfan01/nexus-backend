import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService) {
    }

     /*
  =====================================
  REGISTER
  =====================================
  */

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  /*
  =====================================
  LOGIN
  =====================================
  */

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  /*
  =====================================
  CURRENT USER
  =====================================
  */

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser() user: any,
  ) {
    return this.authService.getProfile(
      user.sub,
    );
  }

  /*
  =====================================
  REFRESH TOKEN
  =====================================
  */

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @CurrentUser() user: any,
  ) {
    return this.authService.refreshToken(
      user.sub,
      user.refreshToken,
    );
  }

  /*
  =====================================
  LOGOUT
  =====================================
  */

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: any,
  ) {
    return this.authService.logout(
      user.sub,
    );
  }

  /*
  =====================================
  EMAIL VERIFICATION
  =====================================
  */

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
  ) {
    return this.authService.verifyEmail(
      token,
    );
  }

  /*
  =====================================
  RESEND VERIFICATION EMAIL
  =====================================
  */

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerificationEmail(
    @CurrentUser() user: any,
  ) {
    return this.authService
      .resendVerificationEmail(
        user.sub,
      );
  }

  /*
  =====================================
  FORGOT PASSWORD
  =====================================
  */

  @Post('forgot-password')
  async forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.authService
      .forgotPassword(dto.email);
  }

  /*
  =====================================
  RESET PASSWORD
  =====================================
  */

  @Post('reset-password')
  async resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      dto,
    );
  }
}

