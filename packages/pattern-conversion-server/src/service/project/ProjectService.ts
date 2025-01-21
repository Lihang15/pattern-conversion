import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { Project } from "../../entity/postgre/project";
import { CreateProjectDTO, QueryProjectDTO, RefreshProjectDTO, UpdateProjectDTO } from "../../dto/project";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { Pattern, PatternConversionStatus, PatternStatus } from "../../entity/postgre/pattern";
import { Op, Order, OrderItem, WhereOptions } from "sequelize";
import * as dayjs from 'dayjs';
import { Account } from "../../entity/postgre/account";
import { ILogger } from "@midwayjs/logger";
import { UtilService } from "../common/UtilService";
import { Group } from "../../entity/postgre/group";
// import * as path from 'path'
// import * as childProcess from 'child_process';


/**
 * 项目服务层
 * @author lihang.wang
 * @date 2024.11.11
 */
@Provide()
export class ProjectService{

    @Inject()
    ctx: Context

    @Inject()
    logger: ILogger
 

    @Inject()
    pcSystemFileService: PcSystemFileService

    @Inject()
    utilService: UtilService

    /**
     * 获取项目列表 业务处理
     * @param {QueryProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async getProjectList(params: QueryProjectDTO):Promise<any>{
        const {current, pageSize, sorter, ...query} = params
        console.log('xxxxxxxxxxxxxxx',params);
        
        const offset: number = current || 1
        const limit : number = pageSize || 5

        // 排序处理开始
        let order: Order = [['createdAt', 'desc']]
        if(sorter){
            order = sorter.split('|').map(
                sort =>
                    sort.split(',').map(item => {
                        if(item === 'ascend' || item === 'descend'){
                            return item.replace('end','')
                        }
                        return item
                    }) as OrderItem
            )
        }
        // 排序处理结束

        // 拼接where条件
        const where: WhereOptions<Project> = {}
        if(query.projectName){
            where.projectName =  {[Op.like]:`%${query.projectName}%`}
        }

        if(Array.isArray(query['updatedAtRange']) && query['updatedAtRange'].length===2){
            where.updatedAt = {
                [Op.between]: [
                    dayjs(query['updatedAtRange'][0]).startOf('day').toDate(),
                    dayjs(query['updatedAtRange'][1]).startOf('day').toDate()
                ]
            }
        }

        // if(query.path){
        //     where.path = {
        //         [Op.like]:`%${query.path}%`
        //     }
        // }
        // 条件添加结束

        // 拼接从表where条件
        const whereAccount: WhereOptions<Account> = {}
        if(query.username){
            whereAccount.username =  {
                [Op.like]:`%${query.username}%`
            }
        }
        const {rows, count} = await Project.findAndCountAll({
            include:[
              {
                model: Account,
                attributes: ['username'],
                where: whereAccount
              }
            ],
            where,
            offset: (offset-1)*limit,
            limit,
            order,
            raw: true,//返回一个普通的javascript对象，而不是sequelize对象
            nest: true, //有关联表时候，数据不平铺，结构化返回
        });
        console.log(rows);
        const result = rows.map((row)=>{
           row['username'] = row.account.username
           row['key'] = row.id
           return row
        })
        
        
        return {project: result, total: count, current: offset, pageSize: limit}
    }

   /**
   * 获取project dashboard
   */
    async getProjectDashboard(params: any):Promise<any>{
        const isCurrentProject = await Project.findOne({
            where:{
                isCurrent: true,
                accountId: this.ctx.account.id
            },
            raw:true
        })
        const Patterns = await Pattern.findAll({
            where:{
                projectId: isCurrentProject.id
            }
        })
        const projects = await Project.findAll({
            where:{
                accountId: this.ctx.account.id,
            },
            order: [['is_current','desc']]
        })
        const projectDropList = []
        for(const project of projects){
            projectDropList.push({key:project.id,label: project.projectName})
        }
        return { Patterns, projectDropList }
    }

        /**
     * 修改项目属性 业务处理
     * 
     * @param {UpdateProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
        async getProjectDetail(id: string | number): Promise<Project>{
            if(!id){
                // 返回当前正在使用的项目
                const isCurrentProject = await Project.findOne({
                    attributes:['id','projectName','inputPath','outputPath','isCurrent','isConversion','pinConfig','pinConfigPath',
                        'portConfig','portConfigPath'
                    ],
                    where:{
                        isCurrent: true,
                        accountId: this.ctx.account.id
                    },
                    raw:true
                })
                       // 项目不存在
                if(!isCurrentProject){
                    throw new BusinessError(BusinessErrorEnum.EXIST,'项目不存在')
                }
                return isCurrentProject

            }
            const projectExist = await Project.findOne({
                attributes:['id','projectName','inputPath','outputPath','isCurrent','isConversion','pinConfig','pinConfigPath',
                    'portConfig','portConfigPath'
                ],
                where:{
                    id,
                },
                raw: true
            })
            // 项目不存在
            if(!projectExist){
                throw new BusinessError(BusinessErrorEnum.EXIST,'项目不存在')
            }
           await this.updateProject(projectExist.id, {isCurrent: true})
            return projectExist
        }

    /**
     * 修改项目属性 业务处理
     * 
     * @param {UpdateProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async updateProject(id: string | number, params: UpdateProjectDTO): Promise<boolean>{

        const projects = await Project.findAll({
            where:{
                accountId: this.ctx.account.id
            }
        })
        for(const project of projects){
            await project.update({isCurrent: false})
        }
        await Project.update({
            ...params
        },{
            where:{
                id 
            }
        })
        return true
    }

    /**
     * 创建项目 业务处理
     * 
     * @param {CreateProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async createProject(params: CreateProjectDTO): Promise<any>{
       
        const { projectName, inputPath, outputPath } = params
        const projectExist = await Project.findOne({
            attributes:['id','projectName'],
            where:{
                projectName,
            },
            raw: true
        })
        // 项目存在 拒绝创建
        if(projectExist && projectExist.projectName===projectName){
            throw new BusinessError(BusinessErrorEnum.EXIST,'项目名已存在')
        }

        // 输入路径不存在，拒绝创建
        if(!await this.pcSystemFileService.directoryExists(inputPath)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'path在oss中没找到')
        }

         // 开启事务
        const transaction = await Project.sequelize.transaction();

        try{
            
        // 自己的其他所有项目设置为不是正在使用的项目，
        const ownProjects = await Project.findAll({
            where:{
                accountId: this.ctx.account.id
            }
        })
        for(const ownProject of ownProjects){
            await ownProject.update({isCurrent:false},{transaction})
        }

        //将新项目存入db，并设置为正在使用的项目
        const project = await Project.create({
            projectName,
            inputPath, 
            outputPath,
            accountId: this.ctx.account.id,
            isCurrent: true,
            isConversion: false
        },{transaction})


        // 开始处理group相关

        // 根据inputPath确定pattern 分组
        const patGroupInfoList = await this.utilService.getPatGroupInfo(inputPath)

        if(patGroupInfoList.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'在path下没找到资源')
        }

        // 获取组列表并在cpp-core/platform-user-setup/${username}/${projectName}生成group结构
        // 是否需要一个撤回操作，业务出现异常，删除掉创建的目录 todo...
        const groupInfoList = await this.utilService.getGroupConfig(patGroupInfoList, this.ctx.account.username, projectName)

        if(groupInfoList.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'创建组失败')
        }
        // 项目group入库
        for(const groupInfo of groupInfoList){
            await Group.create({
                groupName: groupInfo.groupName,
                setupPath: groupInfo.setupPath,
                setupConfig: groupInfo.setupConfig.Common,
                enableTimingMerge: groupInfo.enableTimingMerge,
                projectId: project.id
            },{transaction})
        }

        // pattern关联组并入库
        
        for(const patGroupInfo of patGroupInfoList){
            // 找到group_id
            const group = await Group.findOne({
                attributes: ['id'],
                where:{
                    projectId: project.id,
                    groupName: patGroupInfo.groupName
                },
                transaction
            })
            await Pattern.create({
                projectId: project.id,
                groupId: group.id,
                path: patGroupInfo.path,
                fileName: patGroupInfo.fileName,
                md5: '',
                fileMtime: patGroupInfo.mtime,
                status: PatternStatus.New,
                conversionStatus: PatternConversionStatus.Init,
             },{transaction})
        }
       await transaction.commit()
        return project

        }catch(error){
            this.logger.error(error)
           await transaction.rollback()
           throw {
              message: 'Create Project Failed'
           }

        }

    }

    
    /**
     * 刷新项目 业务处理  
     * 
     * @param {RefreshProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async refreshProject(params: RefreshProjectDTO): Promise<any>{
        console.log(params);
        const { projectName, path } = params
        const projectExist = await Project.findOne({
            attributes:['id','projectName'],
            where:{
                projectName,
                path
            },
            raw: true
        })
      
        if(!projectExist){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'项目不存在')
        }

        if(!await this.pcSystemFileService.directoryExists(path)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'path在oss中没找到')
        }
        const PatternFiles = await this.pcSystemFileService.getFilePaths(path,true,true)
        if(PatternFiles.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'刷新失败,在path下没找到资源')
        }

        /**  初始化事务对象 注入不了sequelize对象，使用Model.sequelize.transaction() 来启动事务，
         并确保多个表的修改操作都在同一个事务中。只要所有的模型都绑定到同一个 Sequelize 实例上，你就可以在一个事务中处理多个表的操作
        */
        const transaction = await Project.sequelize.transaction();
        try{
            const newAndHaveExistPatternFileNames = []
            for(const PatternFile of PatternFiles){
                const pattern = await Pattern.findOne({
                    where: {
                      projectId: projectExist.id,
                      fileName: PatternFile.fileName
                    }
                })
                if(pattern){
                  // 文件内容改了，md5不同,需要修改changed
                  if(pattern.md5 !== PatternFile.md5){
                   await pattern.update({
                        status: 'changed'
                    },{transaction})
                  }
                  newAndHaveExistPatternFileNames.push(pattern.fileName)
    
                }else{
                    // 新文件需要插入,new
                    
                    
                    await Pattern.create({
                        projectId: projectExist.id,
                        fileName: PatternFile.fileName,
                        path: PatternFile.path,
                        md5: PatternFile.md5,
                        status: 'new'
                    },{transaction})
                    newAndHaveExistPatternFileNames.push(pattern.fileName)
                }
            }
    
            //如何有删除的资源 修改状态
            const currentDeleteResoucrceFiles = await Pattern.findAll({
                where:{
                    projectId: projectExist.id,
                    fileName:{
                        [Op.notIn]:newAndHaveExistPatternFileNames
                    }
                },
                raw: true
            })
            if(currentDeleteResoucrceFiles.length>0){
                // 把当前文件删除
                for(const currentDeleteResoucrceFile of currentDeleteResoucrceFiles){
                        await Pattern.destroy({
                            where: {
                                id: currentDeleteResoucrceFile.id
                            },
                            transaction
                        })
                }
            }
            await transaction.commit()
            return true
            
        }catch(error){
           this.logger.error(error)
           await transaction.rollback()
           throw {
              message: 'Refresh Failed'
           }
        }


    }

    /**
     * 转换pattern,事件流服务端主动推送
     * 
     * @param {ConversionProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async conversonProject(){
        // const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20241113/PatternReader.exe'); // C++ 程序路径
        // const args = ['--setup',path.resolve(__dirname,'../../../cpp-core/bin-20241113/config.setup') ]
        // // 执行 C++ 程序并获取输出
        // const child = childProcess.spawn(cppExecutablePath, args);
        // const stream = new PassThrough();
        // 创建一个异步生成器，推送日志给前端
       
        this.ctx.set('Content-Type', 'text/event-stream');
        this.ctx.set('Cache-Control', 'no-cache');
        this.ctx.set('Connection', 'keep-alive');
        this.ctx.set('Transfer-Encoding', 'chunked');
        this.ctx.status = 200;
        this.ctx.respond = false; // 关闭默认响应

        let process = 10;
        let precent = ''
        let index = 2
        const interval = setInterval(() => {
            if (process >= 100) {
                clearInterval(interval);
                this.ctx.res.write(`data: ${JSON.stringify({ process:100,precent:'100%' })}\n\n`)
                this.ctx.res.end(); // 结束响应
            } else {
                process += 10;
                precent = `${index++}/${10}`
                console.log(`data: ${JSON.stringify({ process,precent })}\n\n`);
                this.ctx.res.write(`data: ${JSON.stringify({ process,precent })}\n\n`)
                if(process===100){
                    this.ctx.res.write(`data: ${JSON.stringify({ process:100,precent:'100%' })}\n\n`)
                }
                // this.ctx.res.flushHeaders()
                // this.ctx.res.write(''); 
              
            }
        }, 2000);  
      


        // let process = 0
        // 每当 C++ 程序输出一行日志时，推送给前端
        // child.stdout.on('data', (data) => {
        //   let count = 10
        //   const current_process = 1/count
        //   process = parseFloat((process+current_process).toFixed(1))
        //   if(process>=0.9){
        //     process = 0.9
        //   }
        //   // const logMessage = data.toString();
        //   // const result = 'data: '+JSON.stringify({message:'mm',process: process*100})
        //   // this.ctx.res.write(result);
        //   // setTimeout(()=>{

        //   // },)
        //     // this.ctx.res.write(`data: ${JSON.stringify({ process: process*100 })}\n\n`);
    

        //   // if(true){
        //   //   // 如果读到 文件名，successfully
        //   //   // 1.更新db状态

        //   //   //2.返回process
        //   //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
        //   // }
        //   // if(true){
        //   //   // 如果读到 文件名，error
        //   //   // 1.更新db状态，记录errorlog
        //   //   //2.返回process
        //   //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
        //   // }
          
        // });

        // 处理 C++ 程序的错误输出
        // child.stderr.on('data', (data) => {
        //   // const errorMessage = data.toString();
        //   return this.ctx.res.write(`data: ${JSON.stringify({ process: 50 })}\n\n`);
        //   // this.ctx.res.write('data: '+JSON.stringify({message:'Conversion error with code',process:100}));

        // });
    
        // 处理 C++ 程序结束时
        // child.on('close', (code) => {
        //   if (code === 0) {
        //     // process 更新为100
        //     this.ctx.res.write('data: '+JSON.stringify({message:'Conversion successfully with code',process:100}));
        //     // this.ctx.res.write(`data: Conversion success with code ${code}.\n\n`);
        //   } else {
        //     // this.ctx.res.write(`data: Conversion failed with code ${code}.\n\n`);
        //     this.ctx.res.write('data: '+JSON.stringify({message:'Conversion Failed with code',process:100}));

        //   }
        //   // this.ctx.res.end();
        //   setTimeout(()=>{
        //     this.ctx.res.end(); // 结束响应
        //   },10000)
          
        // });
    
    }

    // async conversonProject(params: any){
    //     const setupPath = params.setupPath
    //     const projectName = params.projectName
    //     console.log('setupPath', setupPath);
    //     console.log('projectName', projectName);

    //     const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20241113/PatternReader.exe'); // C++ 程序路径
    //     // const args = ['--setup',path.resolve(__dirname,'../../../cpp-core/bin-20241113/config.setup') ]
    //     const args = ['--setup',path.resolve(setupPath) ]
    //     // 执行 C++ 程序并获取输出
    //     const child = childProcess.spawn(cppExecutablePath, args);
    //     // 创建一个异步生成器，推送日志给前端
       
    //     this.ctx.set('Content-Type', 'text/event-stream');
    //     this.ctx.set('Cache-Control', 'no-cache');
    //     this.ctx.set('Connection', 'keep-alive');
    //     this.ctx.set('Transfer-Encoding', 'chunked');
    //     this.ctx.status = 200;
    //     this.ctx.respond = false; // 关闭默认响应


    //     let process = 0
    //     let precent = ''
    //     // 每当 C++ 程序输出一行日志时，推送给前端
    //     child.stdout.on('data', (data) => {
    //       let count = 10
    //       let index = 1
    //       precent = `${index++}/${count}`
    //       const current_process = 1/count
    //       process = parseFloat((process+current_process).toFixed(1))
    //       if(process>=0.9){
    //         process = 0.9
    //       }
    //       const logMessage = data.toString();
    //       console.log(logMessage);
          
    //       const result = 'data: '+JSON.stringify({message:'开始',process: process*100, precent})+'\n\n'
    //       this.ctx.res.write(result);

    //         // this.ctx.res.write(`data: ${JSON.stringify({ process: process*100 })}\n\n`);
    

    //       // if(true){
    //       //   // 如果读到 文件名，successfully
    //       //   // 1.更新db状态

    //       //   //2.返回process
    //       //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
    //       // }
    //       // if(true){
    //       //   // 如果读到 文件名，error
    //       //   // 1.更新db状态，记录errorlog
    //       //   //2.返回process
    //       //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
    //       // }
          
    //     });

    //     // 处理 C++ 程序的错误输出
    //     child.stderr.on('data', (data) => {
    //       // const errorMessage = data.toString();
    //     //   return this.ctx.res.write(`data: ${JSON.stringify({ process: 50 })}\n\n`);
    //       this.ctx.res.write('data: '+JSON.stringify({message:'Conversion error with code',process:100,precent:'100%'}));

    //     });
    
    //     // 处理 C++ 程序结束时
    //     child.on('close', (code) => {
    //       if (code === 0) {
    //         // process 更新为100
    //         this.ctx.res.write('data: '+JSON.stringify({message:'Conversion successfully with code',process:100,precent:'100%'}));
    //       } else {
    //         this.ctx.res.write('data: '+JSON.stringify({message:'Conversion Failed with code',process:100,precent:'100%'}));
    //       }
    //       this.ctx.res.end();

    //     });
    
    // }
}