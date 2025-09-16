import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { ArticleService } from "../services/articleService";
import { ArticleCreateSchema, ArticleUpdateSchema, ArticleQuerySchema, ArticleUpdateDTO } from "../dtos/article.dto";

const articleService = new ArticleService();

export class ArticleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

      const parsed = ArticleCreateSchema.parse(req.body);
      const article = await articleService.create(req.user.id, parsed);
      if (!article) return res.status(status.NOT_FOUND).json({ message: "Article not found" });
      const responseArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
      }
      res.status(status.CREATED).json(responseArticle);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ArticleQuerySchema.parse(req.query);
      const articles = await articleService.list(parsed);
      if (!articles || articles.length === 0) {
        return res.status(status.NOT_FOUND).json({ message: "No article" });
      }
      const responseArticles = articles.map((article) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
      }));
      res.status(status.OK).json(responseArticles);
    } catch (err) {
      next(err);
    }
  }

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const articleId = Number(req.params.id);
      const article = await articleService.getDetail(articleId);
      if (!article) return res.status(status.NOT_FOUND).json({ message: "Article not found" });
      const responseArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
      };
      res.status(status.OK).json(responseArticle);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

      const parsed = ArticleUpdateSchema.parse(req.body);
      const articleId = Number(req.params.id);
      const updated = await articleService.update(req.user.id, articleId, parsed);
      if (!updated) return res.status(status.NOT_FOUND).json({ message: "No article"});
      const responseArticle = {
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updatedAt,
      }
      res.status(status.OK).json(responseArticle);
    } catch (err: any) {
      if (err.message === "NOT_FOUND") return res.status(status.NOT_FOUND).json({ message: "Article not found" });
      if (err.message === "FORBIDDEN") return res.status(status.FORBIDDEN).json({ message: "User not matched" });
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

      const articleId = Number(req.params.id);
      await articleService.delete(req.user.id, articleId);
      res.status(status.NO_CONTENT).end();
    } catch (err: any) {
      if (err.message === "NOT_FOUND") return res.status(status.NOT_FOUND).json({ message: "Article not found" });
      if (err.message === "FORBIDDEN") return res.status(status.FORBIDDEN).json({ message: "User not matched" });
      next(err);
    }
  }
}
