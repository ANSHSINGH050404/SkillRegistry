export class AppError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return { error: { code: err.code, message: err.message } };
  }
  return { error: { code: "INTERNAL", message: "Something went wrong." } };
}
