export interface Banner {
  readonly bannerId: string;
  readonly title: string;
  readonly subtitle: string | null;
  readonly imageUrl: string;
  readonly linkUrl: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  linkUrl?: string;
  sortOrder?: number;
}
