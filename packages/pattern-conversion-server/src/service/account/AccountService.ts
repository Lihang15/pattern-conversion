import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { Project } from "../../entity/postgre/project";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { LoginDTO } from "../../dto/account";
import { Account } from "../../entity/postgre/account";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
// import { where } from "sequelize";


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
        console.log('rows,',account);
        // console.log('count,',count);
                
        return account
    }



}