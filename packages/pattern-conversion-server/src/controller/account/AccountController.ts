import { Body, Controller, Inject, Post } from "@midwayjs/core";
import { LoginDTO } from "../../dto/account";
import { ResponseService } from "../../service/common/ResponseService";
import { AccountService } from "../../service/account/AccountService";

/**
 * 账户控制器
 * @author lihang.wang
 * @date 2024.12.11
 */
@Controller('/api')
export class ProjectController{
    @Inject()
    responseService: ResponseService
    @Inject()
    accountService: AccountService

   @Post('/login')
   async login(@Body() params: LoginDTO){
    const result = await this.accountService.login(params)
    return this.responseService.success(result)
   }
}