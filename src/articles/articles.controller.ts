import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Prisma, articles as Article } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createArticle(@Body() body, @Req() req) {
    const user = req.user;
    return this.articlesService.createArticles({
      ...body,
      user_id: user.id,
    });
  }

  @Get()
  async articles(): Promise<{ data: Article[] }> {
    const articles = await this.articlesService.articles();
    return {
      data: articles,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async article(@Param() param: Prisma.articlesWhereUniqueInput) {
    const article = await this.articlesService.article(+param.id);
    return {
      data: article,
    };
  }
}
