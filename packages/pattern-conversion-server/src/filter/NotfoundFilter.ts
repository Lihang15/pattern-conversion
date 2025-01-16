import { Catch, httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

/**
 * 捕获404异常
 * @author lihang.wang
 * @date 2024.12.26
 */
@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    ctx.redirect('/404.html');
  }
}
