import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";



/**
 * @author lihang.wang
 * @description 统一处理返回参数格式
 * @data 2024.11.11
 */
@Provide()
export class ResponseService{
    @Inject()
    ctx: Context
    /**
     * 成功返回参数格式
     * @param data 内容数据
     * @memberof ResponseService 
     */
    async success(data: any){
       this.ctx.body = {
          data,
          code: 0,
          message: 'success'
       }
       this.ctx.status = 200
    }

    /**
     * 错误返回参数格式
     * @param code 错误代码
     * @param message 错误提示
     * @param data 错误内容数据
     */
    async error(code: string | number, message: string){
        this.ctx.body = {
            code,
            message
         }
         this.ctx.status = 200
    }

}