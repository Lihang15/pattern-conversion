import { Controller, Get, Inject } from '@midwayjs/core';
// import { BusinessError, BusinessErrorEnum } from '../error/BusinessError';
import { ResponseService } from '../service/common/ResponseService';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  responseService: ResponseService
  @Inject()
  ctx: Context
  @Get('/')
  async home(): Promise<any> {
    //  throw new BusinessError(BusinessErrorEnum.UNKNOWN,'xaxa')
    this.ctx.logger.info('开始')
    return this.responseService.success({name:'wang'})
  }
}
