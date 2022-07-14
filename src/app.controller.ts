import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessJwtAuthGuard } from './auth/guards/access-jwt-auth.guard';

@Controller()
export class AppController {
  @Get('main')
  @UseGuards(AccessJwtAuthGuard)
  main(@Req() req: Request, @Res() res: Response) {
    if (!req.user) return res.send('<h1>Main Page</h1>');
    return res.send('<h1>Main Page</h1><h1>Logged In</h1>');
  }
}
