import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MidwayValidationError } from '@midwayjs/validate';
import { ResponseService } from '../service/common/ResponseService';


@Catch(MidwayValidationError)
export class ValidationErrorFilter {
  /**
   * 错误捕获
   *
   * @param {MidwayValidationError} err 错误内容
   * @param {Context} ctx 上下文
   * @memberof ValidationErrorFilter
   */
  async catch(err: MidwayValidationError, ctx: Context) {
    const responseService = await ctx.requestContext.getAsync(ResponseService);
    responseService.error(
      err.code,
      err.message,
    );
  }
}
