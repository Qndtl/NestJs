import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

interface UserReturn {
  id: number;
  email: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserReturn> {
    const user = await this.authService.validateUser(email, password);

    if (!user) throw new UnauthorizedException();

    return { id: user.id, email: user.email };
  }
}
