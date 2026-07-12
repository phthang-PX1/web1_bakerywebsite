import type { RequestHandler } from "express";
import {
  getAnalyticsBehavior,
  getAnalyticsOverview,
  getCategoryDistribution,
  getLoyaltyStats,
  getOrderStatusDistribution,
  getRevenueTrend,
  getTierDistribution,
  recordAnalyticsEvents
} from "./analytics.service";
import type {
  AnalyticsBatchInput,
  AnalyticsBehaviorQuery,
  AnalyticsRangeQuery
} from "./analytics.types";

export const recordAnalyticsEventsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    await recordAnalyticsEvents(
      req.body as AnalyticsBatchInput,
      req.user?.userId
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsOverviewController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAnalyticsOverview(
      req.query as unknown as AnalyticsRangeQuery
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsBehaviorController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAnalyticsBehavior(
      req.query as unknown as AnalyticsBehaviorQuery
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrendController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getRevenueTrend(req.query as unknown as AnalyticsRangeQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrderStatusDistributionController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getOrderStatusDistribution(req.query as unknown as AnalyticsRangeQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryDistributionController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getCategoryDistribution(req.query as unknown as AnalyticsRangeQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTierDistributionController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getTierDistribution();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyStatsController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getLoyaltyStats();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
