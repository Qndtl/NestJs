import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../_prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import * as colors from 'colors';
dotenv.config();

interface JwtPayload {
  id: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  /**
   * 로컬 로그인시 사용자 검증
   * @param email
   * @param pwd
   */
  async validateUser(email: string, pwd: string): Promise<any> {
    const user = await this.prisma.users.findFirst({ where: { email } });

    if (!user) throw new NotFoundException('User not found.');

    const checkPassword = await bcrypt.compare(pwd, user.password);

    if (checkPassword) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  /**
   * 로컬 로그인
   * @param user
   */
  async localLogin(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, id: user.id };
    return this.generateToken(payload);
  }

  /**
   * 소셜 로그인
   * access-token & refresh-token -> cookie response
   * refresh-token 암호화 후 DB에 저장
   * @param req
   * @param res
   */
  async socialLogin(req: Request, res: Response): Promise<void> {
    const { password, access_token, refresh_token, ...user } =
      await this.usersService.findOrCreateSocialUser(req.user);

    const jwtPayload: JwtPayload = { id: user.id, email: user.email };

    const { accessToken, refreshToken } = this.generateToken(jwtPayload);

    //Access token & refresh token to cookie
    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);

    //Set hashed refresh token to db
    await this.usersService.updateHashedRefreshToken(user.id, refreshToken);

    res.redirect('http://localhost:3000/api/main');
  }

  /**
   * access_token, refresh_token 생성
   * @param payload
   */
  generateToken(payload: { id: number; email: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '60s',
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    return { accessToken, refreshToken };
  }

  /**
   * 토큰 검증
   * 토큰의 만료 시간 확인
   * @param token
   */
  validateToken(token) {
    const dateNow = new Date();
    const decodedToken = this.jwtService.decode(token, {
      complete: true,
    });
    if (decodedToken['payload'].exp * 1000 > dateNow.getTime())
      return this.jwtService.verify(token, { secret: 'jwt-secret' });
    return null;
  }

  async logout(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: { refresh_token: null },
    });
    return null;
  }
}
