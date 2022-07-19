import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { Prisma, articles as Article } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Article 생성
   * @param body
   */
  createArticles(body: Prisma.articlesCreateInput): Promise<Article> {
    return this.prisma.articles.create({ data: body });
  }

  /**
   * Article 목록 조회
   */
  articles(): Promise<Article[]> {
    return this.prisma.articles.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Article 조회
   * @param id
   */
  article(id: number): Promise<Article> {
    return this.prisma.articles.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
