import { MidwayError } from '@midwayjs/core';

/**
 * 自定义业务异常
 * @author lihang.wang
 * @date 2024.12.26
 */
export const BusinessErrorEnum = {
    NOT_FOUND: 10000,
    PASSWORD_ERROR:10001,
    EXIST: 20001,
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
