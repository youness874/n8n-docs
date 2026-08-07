import type { ZodError } from 'zod';

export class AiGatewayError extends Error {
  readonly raw?: string;

  constructor(message: string, options?: { raw?: string; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'AiGatewayError';
    this.raw = options?.raw;
  }
}

export class AiGatewayInvalidJsonError extends AiGatewayError {
  constructor(raw: string, cause: unknown) {
    super('Provider response was not valid JSON', { raw, cause });
    this.name = 'AiGatewayInvalidJsonError';
  }
}

export class AiGatewaySchemaValidationError extends AiGatewayError {
  readonly issues: ZodError['issues'];

  constructor(raw: string, error: ZodError) {
    super('Provider response failed structured-output validation', { raw, cause: error });
    this.name = 'AiGatewaySchemaValidationError';
    this.issues = error.issues;
  }
}
