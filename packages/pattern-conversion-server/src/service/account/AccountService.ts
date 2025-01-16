import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { LoginDTO } from "../../dto/account";
import { Account } from "../../entity/postgre/account";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { JwtService } from "@midwayjs/jwt";


/**
 * 账户服务层
 * @author lihang.wang
 * @date 2024.12.11
 */
@Provide()
export class AccountService{

    @Inject()
    ctx: Context

    @Inject()
    pcSystemFileService: PcSystemFileService

    @Inject()
    jwtService: JwtService;
    
    /**
     * 用户登录业务处理
     * 
     * @param {LoginDTO} params 参数
     * @return
     * @memberof AccountService
     */
    async login(params: LoginDTO):Promise<any>{
        const { email, password } = params
        const account = await Account.findOne({
            attributes:['id','email'],
            where: {
                email, password
            }
        });
        if(!account){
           throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'用户名或者密码错误')
        }
        const token = await this.jwtService.sign({id: account.id})
        
        return { token }
    }

    /**
     * 获取用户信息
     * @return
     * @memberof AccountService
   */
    async me(){
        return this.ctx.account
    }



}