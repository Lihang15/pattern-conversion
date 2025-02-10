// src/middleware/jwt.middleware

import { Inject, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { BusinessError, BusinessErrorEnum } from '../error/BusinessError';
import { Account } from '../entity/postgre/account';
import { Project } from '../entity/postgre/project';
import { Role } from '../entity/postgre/role';

/**
 * 过滤器,用于鉴权
 * @author lihang.wang
 * @date 2024.12.26
 */
@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'Unauthorized: Token missing')
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'Unauthorized: Token format error')
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          //jwt.verify方法验证token是否有效
         const decode: any =  await this.jwtService.verify(token, {
            complete: true,
          });
          if(decode.payload){
            const account = await Account.findOne({
                where: {
                    id: parseInt(decode.payload.id)
                },
                include: [
                  {model: Role, attributes: ['roleName']}
                ],
                // raw: true
            });
            // console.log(account.dataValues);
            
            let isHaveProject = false
            const project = await Project.findOne({
              where:{
                accountId: account.id
              },
              raw: true
            })
            if(project){
              isHaveProject = true
            }
            const roles = []
            if(account.roles.length>0){
                for (const role of account.roles) {
                  roles.push(role.roleName)
                }
            }
            ctx.account = {...account.dataValues,roles, isHaveProject}
          }
          
        } catch (error) {
          console.log(error);
          
          //需要前端重新登录获取新token
         throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'Unauthorized: Invalid token')
        }
        await next();
      }
    };
  }

  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignorePaths = [
        '/api/login',
        '/api/project/start_pattern_conversion'
      ];
  
      // 检查当前路径是否在忽略列表中
      const ignore = ignorePaths.some((path) => ctx.path.startsWith(path));
      return !ignore; // 返回 true 表示需要中间件处理
  }
}