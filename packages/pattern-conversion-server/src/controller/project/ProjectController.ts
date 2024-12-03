import { Controller, Get, Inject, Post } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { ProjectService } from "../../service/project/ProjectService";

/**
 * 项目控制器
 * @author lihang.wang
 * @date 2024.12.02
 */
@Controller('/api')
export class ProjectController{

    @Inject()
    responseService: ResponseService
    @Inject()
    projectService: ProjectService

    /**
     * 获取项目列表
     * @memberof ProjectController
     */
    @Get('/projects')
    async getProjectList(){
       const result = await this.projectService.getProjectList()
       return this.responseService.success(result)
    }
    @Post('/projects/start_conversion')
    async startConverson(){
        return await this.projectService.startConverson()
    }

}