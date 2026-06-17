import { z } from "zod";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const jsonSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema)
  ])
);

const analyticsEventTypeSchema = z.enum([
  "page_view",
  "click",
  "add_to_cart",
  "checkout_start",
  "purchase"
]);

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.string().trim().min(1).max(max).optional()
  );

const dateRangeQuerySchema = z
  .object({
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional()
  })
  .transform((value) => {
    const dateTo = value.date_to ?? new Date();
    const dateFrom =
      value.date_from ?? new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      dateFrom,
      dateTo
    };
  })
  .refine((value) => value.dateFrom <= value.dateTo, {
    message: "date_from must be before or equal to date_to"
  });

export const analyticsBatchBodySchema = z
  .object({
    events: z
      .array(
        z.object({
          session_id: z.string().trim().min(1).max(100),
          event_type: analyticsEventTypeSchema,
          page_url: z.string().trim().min(1).max(500),
          referrer: optionalTrimmedString(500),
          device_type: z.string().trim().min(1).max(50),
          os: z.string().trim().min(1).max(50),
          browser: z.string().trim().min(1).max(50),
          utm_source: optionalTrimmedString(100),
          utm_medium: optionalTrimmedString(100),
          utm_campaign: optionalTrimmedString(100),
          meta: jsonSchema.optional()
        })
      )
      .min(1)
      .max(20)
  })
  .transform((value) => ({
    events: value.events.map((event) => ({
      sessionId: event.session_id,
      eventType: event.event_type,
      pageUrl: event.page_url,
      referrer: event.referrer,
      deviceType: event.device_type,
      os: event.os,
      browser: event.browser,
      utmSource: event.utm_source,
      utmMedium: event.utm_medium,
      utmCampaign: event.utm_campaign,
      meta: event.meta
    }))
  }));

export const analyticsOverviewQuerySchema = dateRangeQuerySchema;

export const analyticsBehaviorQuerySchema = dateRangeQuerySchema.transform(
  (value) => ({
    ...value,
    limit: 10
  })
);
