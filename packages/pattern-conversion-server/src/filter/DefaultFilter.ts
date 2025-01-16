import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

/**
 * 所有的未分类错误会到这里，在控制台打印，不能让用户看到
 * @author lihang.wang
 * @date 2024.12.26
 */
@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error(err)
    
    return {
      code: 500,
      message: '服务内部error,请联系服务人员检查',
    };
  }
}
