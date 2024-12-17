import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { Project } from "../../entity/postgre/project";
import { CreateProjectDTO } from "../../dto/project";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { PcSystemFileService } from "../common/PcSystemFileService";
import { Resource } from "../../entity/postgre/resource";
import { Op } from "sequelize";


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
    pcSystemFileService: PcSystemFileService

    /**
   * 获取project list
   */
    async getProjectList():Promise<any>{
        const project = await Project.findAll();
        // console.log('rows,',project);
        // console.log('count,',count); 
        return project
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
        const resources = await Resource.findAll({
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
        return { resources, projectDropList }
    }

    /**
   * 更新project
   */
    async updateProject(id: string | number, params: any): Promise<any>{

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
   * 创建 project
   */
    async createProject(params: CreateProjectDTO): Promise<any>{
       
        const { projectName, path } = params
        const projectExist = await Project.findOne({
            attributes:['projectName'],
            where:{
                projectName,
            },
            raw: true
        })
      
        if(projectExist && projectExist.projectName===projectName){
            throw new BusinessError(BusinessErrorEnum.EXIST,'项目名已存在')
        }

        if(!await this.pcSystemFileService.directoryExists(path)){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'path在oss中没找到')
        }

        const resourceFiles = await this.pcSystemFileService.getFilePaths(path,true,true)
        if(resourceFiles.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'在path下没找到资源')
        }
        // console.log(resourceFiles);
        // console.log('accoutn',this.ctx.account.id);
        const ownProjects = await Project.findAll({
            where:{
                accountId: this.ctx.account.id
            }
        })
        for(const ownProject of ownProjects){
            await ownProject.update({isCurrent:false})
        }
        const project = await Project.create({
            projectName,
            path, 
            accountId: this.ctx.account.id,
            isCurrent: true
        })
        for(const resourceFile of resourceFiles){
           await Resource.create({
              projectId: project.id,
              path: resourceFile.path,
              fileName: resourceFile.fileName,
              md5: resourceFile.md5,
              status: 'new',
           })
        }
        
       
        return project
    }

    
    /**
   * 刷新 project
   */
    async refreshProject(params: CreateProjectDTO): Promise<any>{
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
        const resourceFiles = await this.pcSystemFileService.getFilePaths(path,true,true)
        if(resourceFiles.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'刷新失败,在path下没找到资源')
        }
        const newAndHaveExistResourceFileNames = []
        for(const resourceFile of resourceFiles){
            const resource = await Resource.findOne({
                where: {
                  projectId: projectExist.id,
                  fileName: resourceFile.fileName
                }
            })
            if(resource){
              // 文件内容改了，md5不同,需要修改changed
              if(resource.md5 !== resourceFile.md5){
               await resource.update({
                    status: 'changed'
                })
              }
              newAndHaveExistResourceFileNames.push(resource.fileName)

            }else{
                // 新文件需要插入,new
                
                
                await Resource.create({
                    projectId: projectExist.id,
                    fileName: resourceFile.fileName,
                    path: resourceFile.path,
                    md5: resourceFile.md5,
                    status: 'new'
                })
                newAndHaveExistResourceFileNames.push(resource.fileName)
            }
        }

        //如何有删除的资源 修改状态
        const currentDeleteResoucrceFiles = await Resource.findAll({
            where:{
                projectId: projectExist.id,
                fileName:{
                    [Op.notIn]:newAndHaveExistResourceFileNames
                }
            },
            raw: true
        })
        if(currentDeleteResoucrceFiles.length>0){
            // 把当前文件删除
            for(const currentDeleteResoucrceFile of currentDeleteResoucrceFiles){
                    await Resource.destroy({
                        where: {
                            id: currentDeleteResoucrceFile.id
                        }
                    })
            }
        }

        console.log('3333333333333333',newAndHaveExistResourceFileNames);

     return currentDeleteResoucrceFiles

    }

    /**
     * 调用cpp-core开始转换
     */
    async startConverson(){
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

        const interval = setInterval(() => {
            if (process >= 100) {
                clearInterval(interval);
                this.ctx.res.end(); // 结束响应
            } else {
                process += 10;
                console.log(`data: ${JSON.stringify({ process })}\n\n`);
                this.ctx.res.write(`data: ${JSON.stringify({ process })}\n\n`)
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

}