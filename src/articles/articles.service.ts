import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { Prisma, articles as Article } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  createArticles(body: Prisma.articlesCreateInput): Promise<Article> {
    return this.prisma.articles.create({ data: body });
  }

  articles(): Promise<Article[]> {
    return this.prisma.articles.findMany({ include: { user: true } });
  }

  article(id: number): Promise<Article> {
    return this.prisma.articles.findUnique({
      where: { id },
      include: { user: true },
    });
  }
}
