import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Prisma, articles as Article } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  createArticle(@Body() body: Prisma.articlesCreateInput) {
    return this.articlesService.createArticles(body);
  }

  @Get()
  articles(): Promise<Article[]> {
    return this.articlesService.articles();
  }

  @Get(':id')
  article(@Param() param: Prisma.articlesWhereUniqueInput) {
    return this.articlesService.article(+param.id);
  }
}
