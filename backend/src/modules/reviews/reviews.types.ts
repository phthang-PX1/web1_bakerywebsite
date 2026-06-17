export type CreateReviewInput = {
  orderItemId: string;
  rating: number;
  comment?: string;
};

export type AdminReviewListQuery = {
  page: number;
  limit: number;
};
