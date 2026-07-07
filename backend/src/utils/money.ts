import { Prisma } from "@prisma/client";

export const toMoney = (value: Prisma.Decimal | number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return Number(Number(value).toFixed(2));
};
