import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BusinessError } from '../error/BusinessError';
import { ResponseService } from '../service/common/ResponseService';

/**
 * 捕获自定义业务异常
 * @author lihang.wang
 * @date 2024.12.26
 */
@Catch(BusinessError)
export class BusinessErrorFilter {
   /**
   * 错误捕获
   *
   * @param {BusinessError} err 错误内容
   * @param {Context} ctx 上下文
   * @memberof BusinessErrorFilter
   */
   async catch(err: BusinessError, ctx: Context) {
    const responseService = await ctx.requestContext.getAsync(ResponseService);
    responseService.error(err.code, err.message);
  }
}