export interface Review {
  readonly reviewId: string;
  readonly orderItemId: string;
  readonly userId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly imageUrl: string | null;
  readonly isVisible: boolean;
  readonly createdAt: string;
  readonly user?: {
    readonly fullName: string;
    readonly avatarUrl: string | null;
  };
}

export interface CreateReviewRequest {
  orderItemId: string;
  rating: number;
  comment?: string;
}
