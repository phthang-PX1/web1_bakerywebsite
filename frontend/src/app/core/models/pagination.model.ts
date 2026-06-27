export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}
