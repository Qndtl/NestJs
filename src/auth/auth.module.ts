import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { PrismaModule } from '../_prisma/prisma.module';
import * as dotenv from 'dotenv';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
dotenv.config();

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    AccessJwtStrategy,
    GithubStrategy,
    GoogleStrategy,
    RefreshJwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
