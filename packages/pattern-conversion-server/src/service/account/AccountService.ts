import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { InsertUsrsDTO, LoginDTO } from "../../dto/account";
import { Account } from "../../entity/postgre/account";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { JwtService } from "@midwayjs/jwt";
import { Role } from "../../entity/postgre/role";
import { AccountRole } from "../../entity/postgre/accountRole";
import { ILogger } from "@midwayjs/logger";
import { Project } from "../../entity/postgre/project";


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

    @Inject()
    logger: ILogger
    
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

    /**
     * 管理员添加用户
     * @param {InsertUsrsDTO} params 参数
     * @return
     * @memberof AccountService
   */
    async insertUsrs(params: InsertUsrsDTO):Promise<any>{
        // 上面是测试数据
        const { username, email, password, avatar, roles } = params
        const accountExist = await Account.findOne({
            attributes:['id','email','username'],
            where: {
                email, password
            },
            raw: true
        });
        // 用户存在 拒绝插入
        if(accountExist && accountExist.email===email){
            throw new BusinessError(BusinessErrorEnum.EXIST,'用户已存在')
        }
        for (const oneRoleName of roles) {
            const roleExist = await Role.findOne({
                attributes:['id','roleName'],
                where: {
                    roleName: oneRoleName
                },
                raw: true
            });
            // 角色名称不存在，拒绝插入
            if (!roleExist) {
                throw new BusinessError(BusinessErrorEnum.EXIST,'用户角色名称不存在')
            }
        }
        // 开启事务
        const transaction = await Account.sequelize.transaction();
        try {
            //将新用户信息存入db
            const user = await Account.create({
                username,
                email, 
                password,
                avatar
            },{transaction})
            //查找角色名id
            for (const oneRoleName of roles) {
                const roleItem = await Role.findOne({
                    attributes:['id','roleName'],
                    where: {
                        roleName: oneRoleName
                    },
                    raw: true,
                    transaction
                });
                await AccountRole.create({
                    roleId: roleItem.id,
                    accountId: user.id,
                },{transaction});
            }
            await transaction.commit()
            return user;
        } catch(error){
            this.logger.error(error)
            await transaction.rollback()
            throw {
                message: 'Fail to insert users'
            }
        }
    }
    
    /**
     * 管理员查询用户
     * 
     * @return
     * @memberof AccountService
    */
   async queryUsrs(): Promise<any>{
    try{
        const accounts = await Account.findAll({
            include:[
                {
                    model: Role,
                    through:{
                        attributes:[]
                    },
                    required: false
                },
                {
                    model: Project,
                    attributes: ['id'],
                    required: false
                }
            ]
        });
        const users = []
        accounts.map((account) => {
            const isHaveProject = account.projects.length > 0;
            const roleNames = account.roles.map((accountRole) => accountRole.roleName);
            const { projects, ...restData } = account.dataValues;
            users.push({...restData, 'roles': roleNames, 'isHaveProject': isHaveProject})
        });
        return users;
    } catch(error){
        this.logger.error(error)
        throw{
            message: 'Fail to query accout information'
        }
    }
   }

       /**
     * 初始化管理员数据
     * 
     * @return
     * @memberof AccountService
    */
       async initAdminDataInDB(): Promise<any>{
             // 开启事务
        const transaction = await Account.sequelize.transaction();
        try{
            const accounts = await Account.findAll({
                raw: true,
                transaction
            });
            console.log('account正在初始化');
            
            if(accounts.length===0){
               const account = await Account.create({
                username: 'administrator',
                email: 'admin@accotest.com',
                password: 'Accotest123456'
               },{transaction})
               const role = await Role.create({
                  roleName: 'Admin'
               })
               await Role.create({
                roleName: 'Developer'
             },{transaction})
            await AccountRole.create({
                accountId: account.id,
                roleId: role.id
             },{transaction})
             await transaction.commit()
            }
            return true;
        } catch(error){
            await transaction.rollback()
            this.logger.error(error)
            throw{
                message: 'init admin data error'
            }
        }
       }


}