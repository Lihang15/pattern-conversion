import { Body, Controller, Get, Inject, Post } from "@midwayjs/core";
import { LoginDTO } from "../../dto/account";
import { ResponseService } from "../../service/common/ResponseService";
import { AccountService } from "../../service/account/AccountService";

/**
 * 账户控制器
 * @author lihang.wang
 * @date 2024.12.11
 */
@Controller('/api')
export class AccountController{
    @Inject()
    responseService: ResponseService
    @Inject()
    accountService: AccountService

    /**
     * 用户登录
     * 
     * @param {LoginDTO} params 参数
     * @return
     * @memberof AccountController
     */
   @Post('/login')
   async login(@Body() params: LoginDTO){
    const result = await this.accountService.login(params)
    return this.responseService.success(result)
   }

    /**
     * 获取用户信息
     * 
     * @return
     * @memberof AccountController
     */

   @Get('/account/me')
   async me(){
    const result = await this.accountService.me()
    return this.responseService.success(result)
   }
}