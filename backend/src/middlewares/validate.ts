import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./errorHandler";

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export const validate = (schemas: RequestSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const bodyResult = schemas.body?.safeParse(req.body);
    const paramsResult = schemas.params?.safeParse(req.params);
    const queryResult = schemas.query?.safeParse(req.query);

    if (bodyResult && !bodyResult.success) {
      next(new AppError(400, bodyResult.error.message));
      return;
    }

    if (paramsResult && !paramsResult.success) {
      next(new AppError(400, paramsResult.error.message));
      return;
    }

    if (queryResult && !queryResult.success) {
      next(new AppError(400, queryResult.error.message));
      return;
    }

    if (bodyResult?.success) req.body = bodyResult.data;
    if (paramsResult?.success) req.params = paramsResult.data;
    if (queryResult?.success) req.query = queryResult.data;

    next();
  };
};
