import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodSchema } from "zod";
import { AppError } from "./errorHandler";

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

// Rút gọn lỗi Zod thành thông báo field-level, tránh lộ cấu trúc schema/kiểu
// dữ liệu nội bộ ra client (không trả nguyên `error.message` là chuỗi JSON đầy đủ).
const formatZodError = (error: ZodError): string => {
  const flat = error.flatten();
  const fieldMessages = Object.entries(flat.fieldErrors)
    .map(([field, messages]) => `${field}: ${(messages ?? []).join(", ")}`)
    .filter(Boolean);
  const messages = [...flat.formErrors, ...fieldMessages].filter(Boolean);

  return messages.length ? messages.join("; ") : "Invalid request data";
};

export const validate = (schemas: RequestSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const bodyResult = schemas.body?.safeParse(req.body);
    const paramsResult = schemas.params?.safeParse(req.params);
    const queryResult = schemas.query?.safeParse(req.query);

    if (bodyResult && !bodyResult.success) {
      next(new AppError(400, formatZodError(bodyResult.error)));
      return;
    }

    if (paramsResult && !paramsResult.success) {
      next(new AppError(400, formatZodError(paramsResult.error)));
      return;
    }

    if (queryResult && !queryResult.success) {
      next(new AppError(400, formatZodError(queryResult.error)));
      return;
    }

    if (bodyResult?.success) req.body = bodyResult.data;
    if (paramsResult?.success) req.params = paramsResult.data;
    if (queryResult?.success) req.query = queryResult.data;

    next();
  };
};
