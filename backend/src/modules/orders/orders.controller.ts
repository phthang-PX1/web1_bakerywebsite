import type { RequestHandler } from "express";
import {
  cancelMyOrder,
  confirmPaymentWebhook,
  createOrder,
  getAdminOrderDetail,
  getAdminOrders,
  getMyOrderDetail,
  getMyOrders,
  updateAdminOrderStatus
} from "./orders.service";
import type {
  OrderCreateInput,
  OrderListQuery,
  PaymentWebhookInput,
  UpdateOrderStatusInput
} from "./orders.types";

const SESSION_COOKIE_NAME = "session_id";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseCookies = (cookieHeader: string | undefined) => {
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  for (const cookiePart of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookiePart.trim().split("=");
    const rawValue = rawValueParts.join("=");

    if (!rawName || !rawValue) continue;

    try {
      cookies.set(rawName, decodeURIComponent(rawValue));
    } catch {
      cookies.set(rawName, rawValue);
    }
  }

  return cookies;
};

const getSessionId = (cookieHeader: string | undefined) => {
  const sessionId = parseCookies(cookieHeader).get(SESSION_COOKIE_NAME);
  return sessionId && uuidPattern.test(sessionId) ? sessionId : undefined;
};

export const createOrderController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createOrder(
      {
        userId: req.user?.userId,
        sessionId: getSessionId(req.headers.cookie)
      },
      req.body as OrderCreateInput
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyOrdersController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getMyOrders(
      req.user?.userId,
      req.query as unknown as OrderListQuery
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyOrderDetailController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getMyOrderDetail(req.user?.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrderController: RequestHandler = async (req, res, next) => {
  try {
    const result = await cancelMyOrder(req.user?.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const paymentWebhookController: RequestHandler = async (req, res, next) => {
  try {
    const result = await confirmPaymentWebhook(req.body as PaymentWebhookInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminOrdersController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getAdminOrders(req.query as unknown as OrderListQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderDetailController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAdminOrderDetail(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAdminOrderStatusController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateAdminOrderStatus(
      req.params.id,
      req.body as UpdateOrderStatusInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
