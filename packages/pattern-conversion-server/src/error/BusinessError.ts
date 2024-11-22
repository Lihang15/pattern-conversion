import { MidwayError } from '@midwayjs/core';

export const BusinessErrorEnum = {
    NOT_FOUND: 10000,
    PASSWORD_ERROR:10001,
    DATA_NOT_FOUND:20000,
    UNKNOWN: 30000,
}

export class BusinessError extends MidwayError {
  constructor(
    code: string | number,
    message: string,
  ) {
    super(message , <string>code)
  }
}
