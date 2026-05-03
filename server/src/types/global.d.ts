export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFn<T = void> = () => Promise<T>;
export type Paginated<T> = { data: T[]; total: number; page: number; limit: number };
