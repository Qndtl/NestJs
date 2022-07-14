import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('main')
  main() {
    return 'Main page';
  }
}