export interface PagintedResult<T> {
  data: T;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  itemsCount: number;
}
