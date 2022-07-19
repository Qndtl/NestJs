import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { Prisma, users as User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  /**
   * 로컬 사용자 생성
   * @param body
   */
  async createLocalUser(body: Prisma.usersCreateInput): Promise<User> {
    const user = await this.prisma.users.findFirst({
      where: {
        AND: {
          email: body.email,
          provider: 'local',
        },
      },
    });

    //email & provider 중복 체크
    if (user) throw new UnprocessableEntityException('Email already taken.');

    //비밀번호 암호화
    const hashedPassword = await bcrypt.hash(body.password, 10);

    return this.prisma.users.create({
      data: { ...body, password: hashedPassword, provider: 'local' },
    });
  }

  /**
   * 소셜 로그인시 사용자 생성
   * @param profile
   */
  async findOrCreateSocialUser(profile: any): Promise<User> {
    const { name, email, provider, accessToken } = profile;

    const user = await this.prisma.users.findFirst({
      where: { AND: { email, provider } },
    });

    if (user) return user;

    return await this.prisma.users.create({
      data: { name, email, provider, access_token: accessToken },
    });
  }

  /**
   * refresh-token 암호화 후 저장
   * @param userId
   * @param refreshToken
   */
  async updateHashedRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.users.update({
      where: { id: userId },
      data: { refresh_token: hashedRefreshToken },
    });
  }

  /**
   * Refresh token 이 일치 하는 경우 사용자 반환
   * @param refreshToken
   * @param id
   */
  async getUserWhenTokenMatches(
    refreshToken: string,
    id: number,
  ): Promise<User> {
    const user = await this.prisma.users.findFirst({ where: { id } });

    if (!user.refresh_token) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);

    if (isMatch) return user;
  }

  /**
   * 사용자 목록 조회
   */
  async users(): Promise<User[]> {
    return this.prisma.users.findMany({
      include: { articles: { select: { id: true, title: true } } },
    });
  }

  /**
   * 사용자 id로 조회
   * @param id
   */
  async user(id: number): Promise<User> {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
