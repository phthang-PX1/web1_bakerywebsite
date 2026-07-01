export interface Pagination {
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly pagination: Pagination;
}

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}
