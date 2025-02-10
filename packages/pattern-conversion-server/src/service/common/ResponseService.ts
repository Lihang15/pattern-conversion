import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";



/**
 * @author lihang.wang
 * @description 统一处理返回参数格式
 * @date 2024.11.11
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
     * @param status 状态码
     */
    async error(code: string | number, message: string, status?: number){
        this.ctx.body = {
            code,
            message
         }
         this.ctx.status = status? status : 400
        
    }

}