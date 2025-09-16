import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import status from "http-status";
import { CommentService } from "../services/commentService";

const commentService = new CommentService();

// body 검증
const commentSchema = z.object({
  content: z.string().min(5).max(100),
});

// query 검증
const commentListSchema = z.object({
  id: z.coerce.number().int().positive(),
  lastId: z.coerce.number().int().positive().optional(),
});

export class CommentController {
  async createProductComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
      const productId = Number(req.params.id);
      const parsed = commentSchema.parse(req.body);
      const comment = await commentService.createProductComment(req.user.id, productId, parsed.content);
      if (!comment) return res.status(status.NOT_FOUND).json({ message: "No comment" });
      const responseComment = {
        content: comment.content,
      }
      res.status(status.CREATED).json(responseComment);
    } catch (err) {
      next(err);
    }
  }

  async createArticleComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
      const articleId = Number(req.params.id);
      const parsed = commentSchema.parse(req.body);
      const comment = await commentService.createArticleComment(req.user.id, articleId, parsed.content);
      if (!comment) return res.status(status.NOT_FOUND).json({ message: "No comment" });
      const responseComment = {
        content: comment.content,
      }
      res.status(status.CREATED).json(responseComment);
    } catch (err) {
      next(err);
    }
  }

  async modifyComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
      const commentId = Number(req.params.id);
      const parsed = commentSchema.parse(req.body);
      const updated = await commentService.updateComment(req.user.id, commentId, parsed.content);
      if (!updated) return res.status(status.NOT_FOUND).json({ message: "No comment" });
      const responseComment = {
        content: updated.content,
      }
      res.status(status.OK).json(responseComment);
    } catch (err: any) {
      if (err.message === "NOT_FOUND") return res.status(status.NOT_FOUND).json({ message: "Comment not found" });
      if (err.message === "FORBIDDEN") return res.status(status.FORBIDDEN).json({ message: "User not matched" });
      next(err);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
      const commentId = Number(req.params.id);
      await commentService.deleteComment(req.user.id, commentId);
      res.status(status.NO_CONTENT).end();
    } catch (err: any) {
      if (err.message === "NOT_FOUND") return res.status(status.NOT_FOUND).json({ message: "Comment not found" });
      if (err.message === "FORBIDDEN") return res.status(status.FORBIDDEN).json({ message: "User not matched" });
      next(err);
    }
  }

  async productCommentList(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = commentListSchema.parse({ id: req.params.id, lastId: req.query.lastId });
      const comments = await commentService.getProductComments(parsed.id, parsed.lastId);
      if (!comments || comments.length === 0) return res.status(status.NOT_FOUND).json({ message: "No comment" });
      const responseComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
    }));
      res.status(status.OK).json(responseComments);
    } catch (err) {
      next(err);
    }
  }

  async articleCommentList(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = commentListSchema.parse({ id: req.params.id, lastId: req.query.lastId });
      const comments = await commentService.getArticleComments(parsed.id, parsed.lastId);
      if (!comments || comments.length === 0) return res.status(status.NOT_FOUND).json({ message: "No comment" });
      const responseComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
    }));
      res.status(status.OK).json(responseComments);
    } catch (err) {
      next(err);
    }
  }
}