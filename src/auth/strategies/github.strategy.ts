import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.OAUTH_GITHUB_CLIENT,
      clientSecret: process.env.OAUTH_GITHUB_SECRET,
      callbackURL: process.env.OAUTH_GITHUB_CALLBACK,
      scope: 'user',
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile, done) {
    const { id, emails, provider, username } = profile;
    return {
      name: username,
      provider,
      profileId: id,
      email: emails[0].value,
      accessToken,
    };
  }
}
