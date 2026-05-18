export class AniListError extends Error {
  public readonly status?: number;
  public readonly errors?: Array<{ message?: string; status?: number }>;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: Array<{ message?: string; status?: number }>;
    }
  ) {
    super(message);
    this.name = "AniListError";
    this.status = options?.status;
    this.errors = options?.errors;
  }
}