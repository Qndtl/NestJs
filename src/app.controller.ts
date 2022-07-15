import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  @Get('main')
  @UseGuards(JwtAuthGuard)
  main(@Req() req, @Res() res: Response) {
    if (!req.user) return res.send('<h1>Main Page</h1>');
    return res.send('<h1>Main Page</h1><h1>Logged In</h1>');
  }
}
