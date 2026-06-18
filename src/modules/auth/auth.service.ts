import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { JwtService }
  from '@nestjs/jwt';

import { PrismaService }
  from '../../prisma/prisma.service';

import { RegisterDto }
  from './dto/register.dto';

import { LoginDto }
  from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    // private role: RolesGuard
  ) { }

  async register(
    dto: RegisterDto,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    const verificationToken =
      randomBytes(32).toString('hex');

    if (existingUser) {
      throw new ConflictException(
        'User already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(dto.password, 10);

    const user =
      await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          verificationToken,
        },
      });
    await this.mailService
      .sendVerificationEmail(
        user.email,
        verificationToken,
      );

    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    return this.generateTokens(
      user.id,
      user.email,
    );
  }

  async login(
    dto: LoginDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    return this.generateTokens(
      user.id,
      user.email,
    );
  }

  async forgotPassword(
    email: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return {
        message:
          'If an account exists, a reset email has been sent.',
      };
    }

    const resetToken =
      randomBytes(32).toString('hex');

    const expiryDate =
      new Date(
        Date.now() +
        1000 * 60 * 30,
      );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken:
          resetToken,

        passwordResetExpires:
          expiryDate,
      },
    });

    await this.mailService
.sendResetPasswordEmail(
 user.email,
 resetToken,
);

    return {
      message:
        'Password reset email sent',
    };
  }

  async resetPassword(
    dto: {
      token: string;
      password: string;
    },
  ) {
    const user =
      await this.prisma.user.findFirst({
        where: {
          passwordResetToken:
            dto.token,
        },
      });

    if (!user) {
      throw new BadRequestException(
        'Invalid reset token',
      );
    }

    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires <
      new Date()
    ) {
      throw new BadRequestException(
        'Reset token expired',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password:
          hashedPassword,

        passwordResetToken:
          null,

        passwordResetExpires:
          null,
      },
    });

    return {
      message:
        'Password reset successfully',
    };
  }

  async generateTokens(
    userId: string,
    email: string,
  ) {
    const payload = {
      sub: userId,
      email,
      // role: this.role,
      Roles
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_ACCESS_SECRET as string,

          expiresIn:
            process.env.JWT_ACCESS_EXPIRES_IN as any,
        },
      );

    const refreshToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_REFRESH_SECRET as string,

          expiresIn:
            process.env.JWT_REFRESH_EXPIRES_IN as any,
        },
      );

    const hashedRefreshToken =
      await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken:
          hashedRefreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (
      !user ||
      !user.refreshToken
    ) {
      throw new UnauthorizedException();
    }

    const matches =
      await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

    if (!matches) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(
      user.id,
      user.email,
    );
  }

  async getProfile(
    userId: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });
  }

  async verifyEmail(
    token: string,
  ) {
    const user =
      await this.prisma.user.findFirst({
        where: {
          verificationToken:
            token,
        },
      });

    if (!user) {
      throw new BadRequestException(
        'Invalid verification token',
      );
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,

        verificationToken:
          null,
      },
    });

    return {
      message:
        'Email verified successfully',
    };
  }

  async resendVerificationEmail(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (user.emailVerified) {
      throw new BadRequestException(
        'Email already verified',
      );
    }

    const verificationToken =
      randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationToken,
      },
    });

   await this.mailService
.sendVerificationEmail(
 user.email,
 verificationToken,
);
    return {
      message:
        'Verification email sent',
    };
  }

  async logout(userId: string,) {
    await this.prisma.user.update({ where: { id: userId, }, data: { refreshToken: null, }, });
    return { message: 'Logged out successfully', };
  }
}

