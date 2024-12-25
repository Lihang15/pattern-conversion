import { Body, Controller, Get, Inject, Param, Post, Put, Query } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { ProjectService } from "../../service/project/ProjectService";
import { CreateProjectDTO, QueryProjectDTO, RefreshProjectDTO } from "../../dto/project";

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
    async getProjectList(@Query() params: QueryProjectDTO){
       const result = await this.projectService.getProjectList(params)
       return this.responseService.success(result)
    }

    @Get('/projects/dashboard')
    async getProjectDashboard(@Query() params: any){
       const result = await this.projectService.getProjectDashboard(params)
       return this.responseService.success(result)
    }

    @Put('/projects/:id')
    async updateProject(@Param('id') id: string | number, @Body() params: any){
       const result = await this.projectService.updateProject(id,params)
       return this.responseService.success(result)
    }
    @Post('/projects',{summary: "创建项目"})
    async createProject(@Body() params: CreateProjectDTO){
        // console.log('params',params);
        const result = await this.projectService.createProject(params)
        return this.responseService.success(result)
    }

    @Post('/projects/refresh',{summary: "refresh 项目"})
    async refreshProject(@Body() params: RefreshProjectDTO){
        // console.log('params',params);
        const result = await this.projectService.refreshProject(params)
        return this.responseService.success(result)
    }

    @Get('/projects/start_pattern_conversion',{ summary: "事件流 服务端主动推送" })
    async startConverson(@Query() params: any){
        return await this.projectService.startConverson()
    }

}