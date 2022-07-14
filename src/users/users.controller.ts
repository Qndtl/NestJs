import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { users as User, Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 로컬 사용사 생성
   * @param body
   */
  @Post()
  createUser(@Body() body: Prisma.usersCreateInput): Promise<User> {
    return this.usersService.createLocalUser(body);
  }

  /**
   * 사용자 목록 조회
   */
  @Get()
  users(): Promise<User[]> {
    return this.usersService.users();
  }

  /**
   * 사용자 id로 조회
   * @param param
   */
  @Get(':id')
  user(@Param() param: Prisma.usersWhereUniqueInput): Promise<User> {
    return this.usersService.user(+param.id);
  }
}
