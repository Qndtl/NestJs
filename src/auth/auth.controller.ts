import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 로컬 로그인
   * @param req
   * @param res
   */
  @UseGuards(LocalAuthGuard)
  @Post('auth/local/login')
  async login(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.localLogin(
      req.user,
    );

    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);

    res.redirect('http://localhost:3000/api/main');
  }

  /**
   * 로그인된 사용자 프로필
   * @param req
   */
  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * 깃허브 로그인
   */
  @UseGuards(GithubAuthGuard)
  @Get('auth/github')
  async githubLogin(): Promise<void> {
    return;
  }

  /**
   * 깃허브 로그인 콜백
   * @param req
   * @param res
   */
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubLoginCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.socialLogin(req, res);
  }

  /**
   * 구글 로그인
   */
  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<void> {
    return;
  }

  /**
   * 구글 로그인 콜백
   * @param req
   * @param res
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.socialLogin(req, res);
  }

  /**
   * 로그아웃
   * @param req
   * @param res
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    await this.authService.logout(req.user.id);

    res.cookie('access_token', '', { maxAge: 0 });
    res.cookie('refresh_token', '', { maxAge: 0 });

    res.json({ data: 'Success logout' });
  }
}
