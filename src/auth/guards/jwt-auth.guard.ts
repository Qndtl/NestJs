import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as colors from 'colors';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    try {
      const accessToken = req.cookies.access_token;

      if (!accessToken) {
        console.log(colors.red('Access token not found'));
        throw new UnauthorizedException('Access token not found');
      }

      const accessTokenValid = this.authService.validateToken(accessToken);

      if (!accessTokenValid)
        console.log(colors.yellow('Access token is invalid'));
      else console.log(colors.green('Access token still valid'));

      if (accessTokenValid) return this.activate(context);

      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        console.log(colors.red('Refresh token not found'));
        throw new UnauthorizedException('Refresh token not found');
      }

      const refreshTokenValid = this.authService.validateToken(refreshToken);

      if (!refreshTokenValid) {
        console.log(colors.red('Refresh token invalid'));
        throw new UnauthorizedException('Refresh token invalid');
      }

      const user = await this.usersService.getUserWhenTokenMatches(
        refreshToken,
        refreshTokenValid.id,
      );

      const newTokens = this.authService.generateToken({
        id: user.id,
        email: user.email,
      });

      await this.usersService.updateHashedRefreshToken(
        user.id,
        newTokens.refreshToken,
      );

      req.cookies.access_token = newTokens.accessToken;
      req.cookies.refresh_token = newTokens.refreshToken;

      res.cookie('access_token', newTokens.accessToken);
      res.cookie('refresh_token', newTokens.refreshToken);

      console.log(colors.blue('Access token & refresh token refreshed.'));
    } catch (e) {
      console.log(colors.magenta(`Guard catch error: ${e.message}`));

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    } finally {
      return this.activate(context);
    }
  }

  async activate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
