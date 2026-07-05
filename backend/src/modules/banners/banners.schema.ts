import { z } from "zod";

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

const optionalBooleanSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const bannerIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createBannerBodySchema = z.object({
  title: z.string().trim().min(2).max(255),
  subtitle: optionalTrimmed(500),
  linkUrl: optionalTrimmed(500),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const updateBannerBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255).optional(),
    subtitle: optionalTrimmed(500),
    linkUrl: optionalTrimmed(500),
    sortOrder: z.coerce.number().int().min(0).optional(),
    isActive: optionalBooleanSchema
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one banner field is required"
  });

export type CreateBannerInput = z.infer<typeof createBannerBodySchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerBodySchema>;
