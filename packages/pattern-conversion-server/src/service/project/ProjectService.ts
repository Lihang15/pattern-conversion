import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { Project } from "../../entity/postgre/project";
import { ConversionProjectDTO, CreateProjectDTO, DashboardDTO, QueryProjectDTO, RefreshProjectDTO, UpdateProjectDTO } from "../../dto/project";
import { BusinessError, BusinessErrorEnum, FailReason, FailType } from "../../error/BusinessError";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { Pattern, PatternConversionStatus, PatternStatus } from "../../entity/postgre/pattern";
import { Op, Order, OrderItem, WhereOptions } from "sequelize";
import * as dayjs from 'dayjs';
import { Account } from "../../entity/postgre/account";
import { ILogger } from "@midwayjs/logger";
import { PatGroupInfo, SetupPath, UtilService } from "../common/UtilService";
import { Group } from "../../entity/postgre/group";
import * as os from 'os';
import * as path from 'path'
import { NamesService } from "../common/NamesService";
import { PathService } from "../common/PathService";
import { CoreSetupService } from "../common/CoreSetupService";
import { CoreSetupDTO } from "../../dto/coreSetup";
import * as childProcess from 'child_process';


type ResultInfo = {
    patName: string;
    result: string;
    errorMessage?: string;
}

export enum PatternType {
    WGL = 'WGL',
    STIL = 'STIL',
}
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

    @Inject()
    namesService: NamesService

    @Inject()
    pathService: PathService

    @Inject()
    coreSetupService: CoreSetupService

    /**
     * 获取项目列表 业务处理
     * @param {QueryProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
    async getProjectList(params: QueryProjectDTO):Promise<any>{
        const {current, pageSize, sorter, ...query} = params
        
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
        if(!this.ctx.account.isAdmin){
            where.accountId = this.ctx.account.id
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
              },
              {model:Pattern},
            ],
            where,
            offset: (offset-1)*limit,
            limit,
            order,
            distinct: true,
            raw: false,//返回一个普通的javascript对象，而不是sequelize对象  1对多的时候会出问题，不用这个
            nest: false, //有关联表时候，数据不平铺，结构化返回  1对1时候用这个平铺 结合raw:true
        });
        // console.log(rows);
        const result = rows.map((row)=>{
           row.dataValues['username'] = row.account.username
           row.dataValues['key'] = row.id
           row.dataValues['updatedAt'] = dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm:ss')
           // 处理pattern
           let success = 0
           let failed = 0
           row.patterns.map((pattern)=>{
            if(pattern.conversionStatus==='Success'){
                success++
            }
            if(pattern.conversionStatus==='Failed'){
                failed++
            }
  
           })
           row.dataValues['summary'] = {success:`${success}/${row.patterns.length}->Success`,failed: `${failed}/${row.patterns.length}->Failed`}
           return row
        })
        
        
        return {project: result, total: count, current: offset, pageSize: limit}
    }

   /**
   * 获取project dashboard
   */
    async getProjectDashboard(params: DashboardDTO):Promise<any>{
        const { id } = params
         // 统计pattern数量
         const pieChartData = [
            { type: 'WGL', value: 0 },
            { type: 'STIL', value: 0 },
        ]
        const columnChartData = [
            { type: 'Success', value: 0 },
            { type: 'Failed', value: 0 },
            { type: 'Init', value: 0 },
            { type: 'Ongoing', value: 0 },
        ]
        let projectName = 'All'
        let where: any = id?{id}:{}
        // 是管理员
        if(this.ctx.account.isAdmin){
           
            // 查询所有项目的统计图表
            const projects = await Project.findAll({
                include:[{model:Pattern}],
                where
            })
            
            for(const project of projects){
                const patterns = project.patterns
                for(const pattern of patterns){
                        if(pattern.fileName.endsWith('.wgl') || pattern.fileName.endsWith('.wgl.gz')){
                        pieChartData.find((data)=>{
                            return data.type==='WGL'
                        }).value++

                        }
                        if(pattern.fileName.endsWith('.stil') || pattern.fileName.endsWith('.stil.gz')){
                        pieChartData.find((data)=>{
                            return data.type==='STIL'
                        }).value++
                        
                        }
                        if(pattern.conversionStatus==='Init'){
                        columnChartData.find((data)=>{
                            return data.type==='Init'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Ongoing'){
                        columnChartData.find((data)=>{
                            return data.type==='Ongoing'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Success'){
                        columnChartData.find((data)=>{
                            return data.type==='Success'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Failed'){
                        columnChartData.find((data)=>{
                            return data.type==='Failed'
                        }).value++
                        }

                        
                }
            }
            projectName = id?projects[0].projectName: 'All'
               
           
        }else{
           // 不是管理员
            // 查询所有项目的统计图表
            where.accountId = this.ctx.account.id
            const projects = await Project.findAll({
                include:[{model:Pattern}],
                where
            })
            
            for(const project of projects){
                const patterns = project.patterns
                for(const pattern of patterns){
                        if(pattern.fileName.endsWith('.wgl') || pattern.fileName.endsWith('.wgl.gz')){
                        pieChartData.find((data)=>{
                            return data.type==='WGL'
                        }).value++

                        }
                        if(pattern.fileName.endsWith('.stil') || pattern.fileName.endsWith('.stil.gz')){
                        pieChartData.find((data)=>{
                            return data.type==='STIL'
                        }).value++
                        
                        }
                        if(pattern.conversionStatus==='Init'){
                        columnChartData.find((data)=>{
                            return data.type==='Init'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Ongoing'){
                        columnChartData.find((data)=>{
                            return data.type==='Ongoing'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Success'){
                        columnChartData.find((data)=>{
                            return data.type==='Success'
                        }).value++
                        }
                        if(pattern.conversionStatus==='Failed'){
                        columnChartData.find((data)=>{
                            return data.type==='Failed'
                        }).value++
                        }

                        
                }
            }
             projectName = id?projects[0].projectName: 'All'

        }

        return {
            pieChartData, columnChartData,projectName
        }
        
        
    }

        /**
     * 修改项目属性 业务处理
     * 
     * @param {UpdateProjectDTO} params 参数
     * @return
     * @memberof ProjectService
     */
        async getProjectDetail(id: number): Promise<any>{
      
            const projectExist = await Project.findOne({
                attributes:['id','projectName','inputPath','outputPath','isCurrent','isConversion','pinConfig','pinConfigPath',
                    'portConfig','portConfigPath'
                ],
                where:{
                    id,
                },
                // raw: true
                include: [{model: Group,order:[['updatedAt', 'desc']]}]
            })
            // 项目不存在
            if(!projectExist){
                throw new BusinessError(BusinessErrorEnum.EXIST,'项目不存在')
            }
          
            // 返回切换项目的下拉菜单
            const projects = await Project.findAll({
                attributes:['id','projectName','createdAt'],
                where:{
                    accountId: this.ctx.account.id,
                    id:{
                        [Op.notIn]:[projectExist.id]
                    } 
                },
                order: [['createdAt','desc']],
                limit:5
            })
            const projectDropdownMenu = []
            for(const project of projects){
                projectDropdownMenu.push({key:project.id,label: project.projectName})
            }
            // 返回groups
            const groupList: any = projectExist.groups.map((group)=>{
                return {key: group.id ,groupName:group.groupName, enableTimingMerge: group.enableTimingMerge,time: group.updatedAt}
            })
         
            const sortedGroupList = groupList.sort((a, b) => b.time- a.time)
            return {projectInfo: projectExist, projectDropdownMenu,groupList: sortedGroupList}
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
         // 直接将输出目录的绝对路径存入数据库中
         const absoluteOutputPath = path.normalize(path.resolve(outputPath))
         const normalizeIuputpath = path.normalize(path.resolve(inputPath))
         console.log(absoluteOutputPath,normalizeIuputpath);
         
        const projectExist = await Project.findOne({
            attributes:['id','projectName'],
            where:{
                projectName,
            },
            raw: true
        })
        // 若
        // 不是绝对路径，提示用户输入绝对路径的输入目录值
        if (!path.isAbsolute(normalizeIuputpath)){
            throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailType.CREATE_PROJECT_FAIL}${FailReason.NO_ABSOLUTE_INPUT_PATH}`)
        }
        // 若outputPath不是绝对路径，提示用户输入绝对路径的输出目录值
        if (!path.isAbsolute(absoluteOutputPath)){
            throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailType.CREATE_PROJECT_FAIL}${FailReason.NO_ABSOLUTE_OUTPUT_PATH}`)
        }
        // 输入路径不存在，拒绝创建
        if(!await this.pcSystemFileService.directoryExists(normalizeIuputpath)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'path在oss中没找到')
        }
        //输出路径的盘符不存在，拒绝创建
        if(!await this.pcSystemFileService.directoryExists(absoluteOutputPath)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, `${FailType.CREATE_PROJECT_FAIL}${FailReason.NO_EXIST_OUTPUT_ROOT_DIR}`)
        }
        // 若输出目录同输入目录相同,或输出目录是输入目录的子目录,则提示用户重新配置输出目录
        if (await this.pcSystemFileService.isOutputDirInvalid(normalizeIuputpath, absoluteOutputPath)) {
            throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailType.CREATE_PROJECT_FAIL}${FailReason.INVALID_OUTPUT_PATH}`)
        }
        // 项目存在 拒绝创建
        if(projectExist && projectExist.projectName===projectName){
            throw new BusinessError(BusinessErrorEnum.EXIST, '项目名已存在')
        }

       

        //若输入目录下是否有重名的pattern文件，则提示用户检查
        const duplicates = await this.utilService.findDuplicateFilesAsync(normalizeIuputpath);
        if (Object.keys(duplicates).length > 0) {
            let errorLog = '发现重名文件:\n';
            for (const [fileName, filePaths] of Object.entries(duplicates)) {
                errorLog += `文件名: ${fileName}`;
                errorLog += '路径:';
                filePaths.forEach((p) => errorLog += `  - ${p}`);
            }
            const EOL = os.EOL; 
            errorLog += `${EOL}请检查重名pattern文件`
            throw new BusinessError(BusinessErrorEnum.DUPLICAT_FILE, `${FailType.CREATE_PROJECT_FAIL}${errorLog}`)
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
            inputPath: normalizeIuputpath.replace(/\\/g, '/'), 
            outputPath: absoluteOutputPath.replace(/\\/g, '/'),
            accountId: this.ctx.account.id,
            isCurrent: true,
            isConversion: false,
        },{transaction})

        // 开始处理group相关

        // 根据inputPath确定pattern 分组
        const patGroupInfoList = await this.utilService.getPatGroupInfo(normalizeIuputpath)

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
                format: patGroupInfo.format,
                md5: '',
                fileMtime: patGroupInfo.mtime,
                status: PatternStatus.New,
                conversionStatus: PatternConversionStatus.Init,
             },{transaction})
        }
        await transaction.commit()
        // return project
        return await this.utilService.formatRecordTimestamps(project.toJSON())

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
        const { projectName, inputPath } = params
        const normalizeInputPath = path.normalize(inputPath)
        const projectExist = await Project.findOne({
            attributes:['id','projectName'],
            where:{
                projectName,
                inputPath: normalizeInputPath.replace(/\\/g, '/')
            },
            raw: true
        })
      
        if(!projectExist){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, `${FailType.REFRESH_PROJECT_FAIL}${FailReason.NO_EXIST_PROJECT}`)
        }

        // 若inputPath不是绝对路径，提示用户输入绝对路径的输入目录值
        if (!path.isAbsolute(normalizeInputPath)){
            throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailType.REFRESH_PROJECT_FAIL}${FailReason.NO_ABSOLUTE_INPUT_PATH}`)
        }
        // 若inputPath不存在，刷新失败
        if(!await this.pcSystemFileService.directoryExists(normalizeInputPath)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,`${FailType.REFRESH_PROJECT_FAIL}${FailReason.NO_EXIST_INPUT_PATH}`)
        }
        //若输入目录下是否有重名的pattern文件，则提示用户检查
        const duplicates = await this.utilService.findDuplicateFilesAsync(normalizeInputPath);
        if (Object.keys(duplicates).length > 0) {
            let errorLog = '发现重名文件:\n';
            for (const [fileName, filePaths] of Object.entries(duplicates)) {
                errorLog += `文件名: ${fileName}`;
                errorLog += '路径:';
                filePaths.forEach((p) => errorLog += `  - ${p}`);
            }
            const EOL = os.EOL; 
            errorLog += `${EOL}请检查重名pattern文件`
            throw new BusinessError(BusinessErrorEnum.DUPLICAT_FILE, `${FailType.REFRESH_PROJECT_FAIL}${errorLog}`)
        }
        // 根据inputPath确定pattern 分组
        // const PatternFiles = await this.pcSystemFileService.getFilePaths(path,true,true)
        const PatternFiles: PatGroupInfo[] = await this.utilService.getPatGroupInfo(normalizeInputPath, true)
        /**  初始化事务对象 注入不了sequelize对象，使用Model.sequelize.transaction() 来启动事务，
         并确保多个表的修改操作都在同一个事务中。只要所有的模型都绑定到同一个 Sequelize 实例上，你就可以在一个事务中处理多个表的操作
        */
        const transaction = await Project.sequelize.transaction();
        try{
            // 若inputPath下pattern文件都删除则关联的group/pattern都要被删除
            if(PatternFiles.length <= 0){
                await Pattern.destroy({
                    where: {
                        projectId: projectExist.id
                    },
                    transaction
                });
                // 删除group记录之前，先删除group对应的目录结构
                const deleteGroups = await Group.findAll({
                    attributes: ['setupPath'],
                    where:{
                        projectId: projectExist.id,
                    },
                    raw: true
                })
                for (const deleteGroup of deleteGroups){
                    const deleteGroupSetupPath: SetupPath = deleteGroup.setupPath as SetupPath
                    let deleteSetupDir = ''
                    if (deleteGroupSetupPath.stilSetupPath.length > 0){
                        deleteSetupDir = await path.dirname(deleteGroupSetupPath.stilSetupPath)
                    } else if (deleteGroupSetupPath.wglSetupPath.length > 0){
                        deleteSetupDir = await path.dirname(deleteGroupSetupPath.wglSetupPath)
                    }
                    if (deleteSetupDir.length > 0){
                        await this.pcSystemFileService.deletePathIfExists(deleteSetupDir)
                    }
                }
                await Group.destroy({
                    where: {
                        projectId: projectExist.id
                    },
                    transaction
                });
                await Project.destroy({
                    where: {
                        id: projectExist.id
                    },
                    transaction
                });
    
                await transaction.commit();
                return true;
            }
            // 获取组列表并在cpp-core/platform-user-setup/${username}/${projectName}生成group结构
            const groupInfoList = await this.utilService.getGroupConfig(PatternFiles, this.ctx.account.username, projectName)
            if(groupInfoList.length <= 0){
                throw new BusinessError(BusinessErrorEnum.NOT_FOUND, `${FailType.REFRESH_PROJECT_FAIL}${FailReason.MAKE_PATTERN_GROUP_FAIL}`)
            }
            // 更新group表信息
            const newAndHaveExistGroupName = [];
            for (const groupInfo of groupInfoList){
                const group = await Group.findOne({
                    where: {
                        groupName: groupInfo.groupName,
                        projectId: projectExist.id
                    },
                    raw: true
                });
                if (group){
                    // 查找到的group记录，不更新数据库中group相关配置信息，防止用户已在界面上更新过group相关配置信息
                    newAndHaveExistGroupName.push(group.groupName)
                } else{ // 新group，则group信息入库
                    await Group.create({
                        groupName: groupInfo.groupName,
                        setupPath: groupInfo.setupPath,
                        setupConfig: groupInfo.setupConfig.Common,
                        enableTimingMerge: groupInfo.enableTimingMerge,
                        projectId: projectExist.id
                    },{transaction});
                    newAndHaveExistGroupName.push(groupInfo.groupName)
                }
            }
            // 更新pattern表信息
            const newAndHaveExistPatternFileNames = []
            for(const PatternFile of PatternFiles){
                const pattern = await Pattern.findOne({
                    where: {
                      projectId: projectExist.id,
                      fileName: PatternFile.fileName
                    }
                })
                if(pattern){
                  // 文件内容改了，fileMtime不同,需要修改changed
                  if(pattern.fileMtime !== PatternFile.mtime){
                   await pattern.update({
                        status: PatternStatus.Changed
                    },{transaction})
                  }
                  newAndHaveExistPatternFileNames.push(pattern.fileName)
    
                }else{
                    // 新文件需要插入,new
                    // 先找到pattern关联的group
                    const group = await Group.findOne({
                        attributes: ['id'],
                        where:{
                            projectId: projectExist.id,
                            groupName: PatternFile.groupName
                        },
                        transaction
                    });
                    await Pattern.create({
                        projectId: projectExist.id,
                        groupId: group.id,
                        fileName: PatternFile.fileName,
                        path: PatternFile.path,
                        format: PatternFile.format,
                        md5: '',
                        fileMtime: PatternFile.mtime,
                        status: PatternStatus.New,
                        conversionStatus: PatternConversionStatus.Init,
                    },{transaction})
                    newAndHaveExistPatternFileNames.push(PatternFile.fileName)
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
            // 若有删除的group, 则删除group表对应记录
            const currentDeleteGroups = await Group.findAll({
                where:{
                    projectId: projectExist.id,
                    groupName:{
                        [Op.notIn]:newAndHaveExistGroupName
                    }
                },
                raw: true
            })
            if(currentDeleteGroups.length>0){
                for(const currentDeleteGroup of currentDeleteGroups){
                    // 删除group记录之前，先删除group对应的目录结构
                    const deleteSetupPath: SetupPath = currentDeleteGroup.setupPath as SetupPath
                    let setupDir = ''
                    if (deleteSetupPath.stilSetupPath.length > 0){
                        setupDir = path.dirname(deleteSetupPath.stilSetupPath)
                    } else if(deleteSetupPath.wglSetupPath.length > 0) {
                        setupDir = path.dirname(deleteSetupPath.wglSetupPath)
                    }
                    if (setupDir.length > 0){
                        await this.pcSystemFileService.deletePathIfExists(setupDir)
                    }

                    await Group.destroy({
                        where: {
                            id: currentDeleteGroup.id
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
    async conversonProject(params: ConversionProjectDTO){

        const { projectId, ids } = params
        
        this.ctx.set('Content-Type', 'text/event-stream');
        this.ctx.set('Cache-Control', 'no-cache');
        this.ctx.set('Connection', 'keep-alive');
        this.ctx.set('Transfer-Encoding', 'chunked');
        this.ctx.status = 200;
        this.ctx.respond = false; // 关闭默认响应


        // 查找project表，根据isConversion判断是否有正在执行pattern conversion的项目
        // 若有project的isConversion状态为true, 则拒绝本次conversion任务
        const ongoingProject = await Project.findOne({
            attributes: ['id','projectName'],
            where: {
                isConversion: true
            },
            raw: true
        });
        if (ongoingProject){
            // throw new BusinessError(BusinessErrorEnum.EXIST, `有项目正在执行pattern转换: ${ongoingProject.projectName}, 请稍后再提交转换任务`)
            this.ctx.res.write(`data: ${JSON.stringify({ progress: 0, precent: 0,error: `有项目正在执行pattern转换: ${ongoingProject.projectName}, 请稍后再提交转换任务`})}\n\n`);
            this.ctx.res.write(`data: ${JSON.stringify({message:'Conversion with code',progress:100,precent:100})}\n\n`);
            this.ctx.res.end();
            return
        }
        const patternIdList = await this.getPatIdList(ids)
        if (patternIdList.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, '没有待转的pattern文件')
        }
        // 根据projectId 查到project的输出路径
        const project = await Project.findOne({
            where: {
                id: projectId
            },
            raw: true
        })
        if (!project){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, '未查找到待转pattern文件对应的项目信息')
        }

        // 根据pattern id 查找pattern表，得到groupName以及group相关配置信息
        const patterns = await Pattern.findAll({
            include: [
                {
                    model: Group
                }
            ],
            // attributes: ['path', 'fileName', 'format'],
            where: {
                id: patternIdList,
                projectId: projectId
            },
            raw: true,
            nest: true
        });
        if (patterns.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, '未查找到pattern文件相关信息')
        }

        const sendProgress = (filename, progress, precent) => {
            console.log(`data: ${JSON.stringify({ filename, progress, precent })}\n\n`);
            
            this.ctx.res.write(`data: ${JSON.stringify({ filename, progress, precent })}\n\n`);
        };

        this.logger.info(`There are ${patterns.length} pattern files wait to conversion`)

        // 按照groupName为key组织pattern数据
        const groupConfig: { [key: string]: {
            groupId: number,
            stilPatList: string[],  
            wglPatList: string[], 
            enableTimingMerge: Boolean, 
            setupConfig: CoreSetupDTO,
            setupPath: SetupPath,
        }} = {}; 
        for (const pat of patterns) {
            const extname = pat.format
            const groupName = pat.group.groupName
            if (!(groupName in groupConfig)) {
                groupConfig[groupName] = {
                    groupId: pat.groupId,
                    stilPatList: [],
                    wglPatList: [],
                    enableTimingMerge: pat.group.enableTimingMerge,
                    setupConfig: pat.group.setupConfig as CoreSetupDTO,  // 这里只保存了界面上setup参数配置的值
                    setupPath: pat.group.setupPath as SetupPath
                  };
            }
            if (extname === '.stil') {
                groupConfig[groupName].stilPatList.push(pat.path)
            } else if(extname === '.wgl') {
                groupConfig[groupName].wglPatList.push(pat.path)
            }
        }
        // 按照pattern group循环遍历执行pattern conversion
        let allPatternCount = patterns.length;
        let executedPatternCount = {count: 0}
        let setupDir: string = '';
        let inputFileType = PatternType.WGL;
        let inputFiles: string = '';
        let combinationsFile: string = 'None';
        const outputPath = path.normalize(project.outputPath);
        try {
            for (const groupName in groupConfig) {
                if (groupConfig[groupName].stilPatList.length > 0 || groupConfig[groupName].wglPatList.length > 0) {
                    
                    const groupId = groupConfig[groupName].groupId
                    const setupPath = groupConfig[groupName].setupPath
                    const coreSetup: CoreSetupDTO = groupConfig[groupName].setupConfig
                    if (groupConfig[groupName].stilPatList.length > 0) {
                        inputFileType = PatternType.STIL
                        const stilSetupPath = setupPath.stilSetupPath
                        setupDir = path.dirname(stilSetupPath)
                        if (groupConfig[groupName].enableTimingMerge) {
                            combinationsFile = path.join(setupDir, await this.namesService.combinationsFileName(groupName))
                        }
                        inputFiles = groupConfig[groupName].stilPatList.join(',')
                        // 设置setup中不在UI上配置的参数
                        coreSetup.input_file_type = inputFileType
                        coreSetup.input_file_path = inputFiles
                        coreSetup.workdir = outputPath
                        coreSetup.project_name = groupName
                        coreSetup.combinations_file = combinationsFile
                        if (stilSetupPath.length > 0){
                            if (await this.coreSetupService.genSetup(stilSetupPath, coreSetup)) {
                                await this.executeCppCore(sendProgress, stilSetupPath, projectId, groupId, allPatternCount, executedPatternCount)
                            }
                        }
                    } else if (groupConfig[groupName].wglPatList.length > 0) {
                        inputFileType = PatternType.WGL
                        const wglSetupPath = setupPath.wglSetupPath
                        setupDir = path.dirname(wglSetupPath)
                        if (groupConfig[groupName].enableTimingMerge) {
                            combinationsFile = path.join(setupDir, await this.namesService.combinationsFileName(groupName))
                        }
                        inputFiles = groupConfig[groupName].wglPatList.join(',')
                        // 设置setup中不在UI上配置的参数
                        coreSetup.input_file_type = inputFileType
                        coreSetup.input_file_path = inputFiles
                        coreSetup.workdir = path.normalize(outputPath)
                        coreSetup.project_name = groupName
                        coreSetup.combinations_file = combinationsFile
                        if (wglSetupPath.length > 0){
                            if (await this.coreSetupService.genSetup(wglSetupPath, coreSetup)) {
                                await this.executeCppCore(sendProgress, wglSetupPath, projectId, groupId, allPatternCount, executedPatternCount)
                            }
                        }
                    }
                }
            }
            // pattern conversion完成后，将project表中的is_conversion状态置为false
            await this.updateProjectConversionStatus(projectId, false);
            this.ctx.res.write(`data: ${JSON.stringify({ end:'Conversion successfully with code',progress:100,precent:100})}\n\n`);
            this.ctx.res.write(`data: ${JSON.stringify({message:'Conversion successfully with code',progress:100,precent:100})}\n\n`);;
            console.log('data: '+JSON.stringify({message:'Conversion successfully with code',progress:100, precent:'100'}));
            this.ctx.res.end();
        } catch (error) {
            // pattern conversion完成后，将project表中的is_conversion状态置为false
            await this.updateProjectConversionStatus(projectId, false);
            console.error(`Error executing C++ process: ${error}`);
            this.ctx.res.write(`data: ${JSON.stringify({ progress: 0, precent: 0,error: 'Error occurred'})}\n\n`);
            this.ctx.res.end();
        }
    }

    /**
     * 起子进程调用core, 实时监听core的日志，计算process 和 percent
     * 
     * @param {string} setupPath 参数
     * @return
     * @memberof ProjectService
     */
    async executeCppCore(sendProgress, setupPath: string, projectId: number, groupId: number, allPatternCount, executedPatternCount) {
        const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20250224/PatternReader.exe'); // C++ 程序路径
        const args = ['--setup', setupPath]
        this.logger.info(`run command: ${cppExecutablePath} ${args.join(' ')}`)
        
        return new Promise((resolve, reject) => {
            // 执行 C++ 程序并获取输出
            const child = childProcess.spawn(cppExecutablePath, args);
            // 更新project表中is_conversion状态为false
            this.updateProjectConversionStatus(projectId, true)
            let patternCount = executedPatternCount.count;
            // 监听子进程错误事件
            child.on('error', (error) => {
                reject(new BusinessError('CHILD_PROCESS_ERROR', error.message));
            });
            // 监听子进程stdout
            child.stdout.on('data', (data) => {
                let progress = 0;
                let precent = '';
                // 处理core输出的日志文件
                const logMessage = data.toString();
                if (logMessage.startsWith("start,")) {
                    progress = patternCount * 10;
                    precent = `${patternCount}/${allPatternCount}`;
                    sendProgress(logMessage.split(",")[1].trim(), progress,precent); // 推送进度
                    const ongoinResult: ResultInfo = {patName: logMessage.split(",")[1].trim(), result: PatternConversionStatus.Ongoing}
                    try{
                        this.updatePattern(ongoinResult, projectId, groupId)
                    } catch(error){
                        this.logger.error(`Failt to update is_conversion in project: ${error}`)
                        // 更新project表中is_conversion状态为false
                        this.updateProjectConversionStatus(projectId, false)
                    }
                }
                if (logMessage.startsWith("resultSendWebServer,successfully,")) {
                    patternCount++
                    progress = patternCount * 10;
                    precent = `${patternCount}/${allPatternCount}`;
                    sendProgress(logMessage.split(",")[2].trim(), progress,precent); // 推送进度
                    const successResult: ResultInfo = {patName: logMessage.split(",")[2].trim(), result: PatternConversionStatus.Success}
                    try {
                        this.updatePattern(successResult, projectId, groupId)  // 更新pattern的状态信息
                    } catch(error){
                        this.logger.error(`Failt to update is_conversion in project: ${error}`)
                        // 更新project表中is_conversion状态为false
                        this.updateProjectConversionStatus(projectId, false)
                    }
                }
                if (logMessage.startsWith("resultSendWebServer,failed,")) {
                    patternCount++
                    progress = patternCount * 10;
                    precent = `${patternCount}/${allPatternCount}`;
                    sendProgress(logMessage.split(",")[2].trim(), progress,precent); // 推送进度
                    const matchInfo = logMessage.split(",")
                    const failResult: ResultInfo = {patName: logMessage.split(",")[2].trim(), result: PatternConversionStatus.Failed, errorMessage: matchInfo[3]}
                    try {
                        this.updatePattern(failResult, projectId, groupId)  // 更新pattern的状态信息
                    } catch(error){
                        this.logger.error(`Failt to update is_conversion in project: ${error}`)
                        // 更新project表中is_conversion状态为false
                        this.updateProjectConversionStatus(projectId, false)
                    }
                }
            });
            // 监听子进程的标准错误
            child.stderr.on('data', (data) => {
                // 更新project表中is_conversion状态为false
                // this.updateProjectConversionStatus(projectId, false)
                const errMessage = data.toString()
                this.logger.error(`Child process runs with error: ${errMessage}`);
                reject(`${errMessage}`)
            });
            child.on('exit', (code) => {
                if (code === 0){
                    resolve('Child process exit successfully')
                    executedPatternCount.count = patternCount
                } else {
                    reject(new Error(`Child process exited with code ${code}`));
                }
            });
            child.on('close', (code) => {
              if (code === 0) {
                resolve('Child process close successfully')
                executedPatternCount.count = patternCount
              } else {
                    reject(new Error(`Child process close with code ${code}`));
                }
            });
        });
    }

    /** 
     * 更新pattern表中相关信息
     * @param {ResultInfo} resultInfo conversion core的标准输出日志的匹配结果信息
     * @param {number} projectId project id
     * @param {number} groupId group id
     * @return 
    */
    async updatePattern(resultInfo: ResultInfo, projectId: number, groupId: number) {
        if (resultInfo.patName.length > 0){
            try{
                // 根据匹配结果更新patter表中 conversionStatus
                const pattern = await Pattern.findOne({
                    where:{
                        fileName: resultInfo.patName,
                        projectId: projectId,
                        groupId: groupId,
                    }
                });

                if (!pattern){
                    throw new BusinessError(BusinessErrorEnum.NOT_FOUND, 'Cannot find pattern information')
                }

                if (resultInfo.result === PatternConversionStatus.Ongoing) {
                    await pattern.update({
                        conversionStatus: PatternConversionStatus.Ongoing,
                        errorLog: ''
                    });
                }
                const conversionFrequency = pattern.conversionFrequency + 1
                if (resultInfo.result === PatternConversionStatus.Success){
                    await pattern.update({
                        conversionFrequency: conversionFrequency,
                        conversionStatus: PatternConversionStatus.Success,
                        errorLog: ''
                    });
                } 
                if (resultInfo.result === PatternConversionStatus.Failed){
                    await pattern.update({
                        conversionFrequency: conversionFrequency,
                        conversionStatus: PatternConversionStatus.Failed,
                        errorLog: resultInfo.errorMessage
                    });
                }
            } catch(error){
                this.logger.error(error)
                throw {
                    message: 'Fail to updata pattern conversionFrequency, conversionStatus, errorLog'
                }
            }
        } 
    }

    /** 
     * 将pattern id字符串转为 pattern id list, 多个pattern id是用逗号分隔
     * @param {string} ids 用户勾选的待转pattern文件的id, 用逗号分隔
     * @return {string} `{"process":100,"precent":"100%"}` json格式的字符串进度信息
    */
    async getPatIdList(ids: string): Promise<number[]>{
        try{
            const patternIds = ids.split(',')
            const patternIdList = patternIds.map(patId => {
                const trimmedPart = patId.trim();
                const number = parseInt(trimmedPart, 10);
                // 检查是否为有效的正整数 pattern id
                if (isNaN(number) || number < 0) {
                    throw new BusinessError(BusinessErrorEnum.UNKNOWN, `Invalid positive integer: ${trimmedPart}`)
                }

                return number;
            });

            return patternIdList;
        } catch(error){
            this.logger.error(error)
        }
    }

    /**
     * 修改项目的conversion 状态
     * 
     * @param {string | number} id project id
     * @param {boolean} isConversion project conversion 状态
     * @return
     * @memberof ProjectService
     */
    async updateProjectConversionStatus(id: string | number, isConversion: boolean): Promise<boolean>{
        const project = await Project.findOne({
            where:{
                id: id
            }
        })
        if (!project){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, 'Cannot find project information')
        }
        try{
            await project.update({isConversion: isConversion})
            return true
        } catch(error){
            this.logger.error(error)
            throw {
                message: 'Fail to updata project isConversion'
            }
        }
    }

    // /**
    //  * 转换pattern,事件流服务端主动推送
    //  * 
    //  * @param {ConversionProjectDTO} params 参数
    //  * @return
    //  * @memberof ProjectService
    //  */
    // async conversonProject(){
    //     // const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20241113/PatternReader.exe'); // C++ 程序路径
    //     // const args = ['--setup',path.resolve(__dirname,'../../../cpp-core/bin-20241113/config.setup') ]
    //     // // 执行 C++ 程序并获取输出
    //     // const child = childProcess.spawn(cppExecutablePath, args);
    //     // const stream = new PassThrough();
    //     // 创建一个异步生成器，推送日志给前端
       
    //     this.ctx.set('Content-Type', 'text/event-stream');
    //     this.ctx.set('Cache-Control', 'no-cache');
    //     this.ctx.set('Connection', 'keep-alive');
    //     this.ctx.set('Transfer-Encoding', 'chunked');
    //     this.ctx.status = 200;
    //     this.ctx.respond = false; // 关闭默认响应

    //     let process = 10;
    //     let precent = ''
    //     let index = 2
    //     const interval = setInterval(() => {
    //         if (process >= 100) {
    //             clearInterval(interval);
    //             this.ctx.res.write(`data: ${JSON.stringify({ process:100,precent:'100%' })}\n\n`)
    //             this.ctx.res.end(); // 结束响应
    //         } else {
    //             process += 10;
    //             precent = `${index++}/${10}`
    //             console.log(`data: ${JSON.stringify({ process,precent })}\n\n`);
    //             this.ctx.res.write(`data: ${JSON.stringify({ process,precent })}\n\n`)
    //             if(process===100){
    //                 this.ctx.res.write(`data: ${JSON.stringify({ process:100,precent:'100%' })}\n\n`)
    //             }
    //             // this.ctx.res.flushHeaders()
    //             // this.ctx.res.write(''); 
              
    //         }
    //     }, 2000);  
      


    //     // let process = 0
    //     // 每当 C++ 程序输出一行日志时，推送给前端
    //     // child.stdout.on('data', (data) => {
    //     //   let count = 10
    //     //   const current_process = 1/count
    //     //   process = parseFloat((process+current_process).toFixed(1))
    //     //   if(process>=0.9){
    //     //     process = 0.9
    //     //   }
    //     //   // const logMessage = data.toString();
    //     //   // const result = 'data: '+JSON.stringify({message:'mm',process: process*100})
    //     //   // this.ctx.res.write(result);
    //     //   // setTimeout(()=>{

    //     //   // },)
    //     //     // this.ctx.res.write(`data: ${JSON.stringify({ process: process*100 })}\n\n`);
    

    //     //   // if(true){
    //     //   //   // 如果读到 文件名，successfully
    //     //   //   // 1.更新db状态

    //     //   //   //2.返回process
    //     //   //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
    //     //   // }
    //     //   // if(true){
    //     //   //   // 如果读到 文件名，error
    //     //   //   // 1.更新db状态，记录errorlog
    //     //   //   //2.返回process
    //     //   //   this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
    //     //   // }
          
    //     // });

    //     // 处理 C++ 程序的错误输出
    //     // child.stderr.on('data', (data) => {
    //     //   // const errorMessage = data.toString();
    //     //   return this.ctx.res.write(`data: ${JSON.stringify({ process: 50 })}\n\n`);
    //     //   // this.ctx.res.write('data: '+JSON.stringify({message:'Conversion error with code',process:100}));

    //     // });
    
    //     // 处理 C++ 程序结束时
    //     // child.on('close', (code) => {
    //     //   if (code === 0) {
    //     //     // process 更新为100
    //     //     this.ctx.res.write('data: '+JSON.stringify({message:'Conversion successfully with code',process:100}));
    //     //     // this.ctx.res.write(`data: Conversion success with code ${code}.\n\n`);
    //     //   } else {
    //     //     // this.ctx.res.write(`data: Conversion failed with code ${code}.\n\n`);
    //     //     this.ctx.res.write('data: '+JSON.stringify({message:'Conversion Failed with code',process:100}));

    //     //   }
    //     //   // this.ctx.res.end();
    //     //   setTimeout(()=>{
    //     //     this.ctx.res.end(); // 结束响应
    //     //   },10000)
          
    //     // });
    
    // }

    
//     /**
//      * 转换pattern,事件流服务端主动推送
//      * 
//      * @param {ConversionProjectDTO} params 参数
//      * @return
//      * @memberof ProjectService
//      */
//     async conversonProject(){
//         this.ctx.set('Content-Type', 'text/event-stream');
//         this.ctx.set('Cache-Control', 'no-cache');
//         this.ctx.set('Connection', 'keep-alive');
//         this.ctx.set('Transfer-Encoding', 'chunked');
//         this.ctx.status = 200;
//         this.ctx.respond = false; // 关闭默认响应

//         let allPatternCount = 9;
//         let executedPatternCount = {count: 1}

       
//         // 要启动的进程总数
//         let totalProcesses = 3

//           const sendProgress = (progress,precent) => {
//             console.log(`data: ${JSON.stringify({ progress, precent })}\n\n`);
            
//             this.ctx.res.write(`data: ${JSON.stringify({ progress, precent })}\n\n`);
//           };
        
//           try {
//             // 通过callback去拿到所有进程的进度
//             for (let i = 0; i < totalProcesses; i++) {
//                 await this.executeCppCore(sendProgress,allPatternCount, executedPatternCount);
//             }
//             this.ctx.res.write('data: '+JSON.stringify({message:'Conversion successfully with code',progress:1,precent:'100'}));
//             console.log('data: '+JSON.stringify({message:'Conversion successfully with code',progress:1,precent:'100'}));
//             this.ctx.res.end();
//           } catch (error) {
//             console.error(`Error executing C++ process: ${error}`);
//             this.ctx.res.write(`data: ${JSON.stringify({ progress: 0, precent: 'Error occurred' })}\n\n`);
//             this.ctx.res.end();
//           }
    
//     }

// // 启动进程去执行Cpp程序
// async executeCppCore(sendProgress,allPatternCount, executedPatternCount) {
//   return new Promise((resolve, reject) => {
//     let index = 0; // 模拟进程 执行pattern数量

//     let patternCount = executedPatternCount.count

//     // 每隔 2 秒更新进度
//     const interval = setInterval(() => {
//       if (index >= 30) {
//         resolve('进程成功关闭')
//         executedPatternCount.count = patternCount
//         clearInterval(interval);
//       } else {
//         index += 10;
//         // 也就是你在child_process.on(data)中，data通过正则分析 出success/faild  直接推送进度到前端，并修改db状态，
//         // let progress = Math.floor(patternCount / allPatternCount * 10) / 10;
//         let progress = patternCount * 10
//         let precent = `${patternCount}/${allPatternCount}`
       
//         patternCount++
//         sendProgress(progress,precent); // 推送进度
//       }
//     }, 2000);
//   });
// }




}