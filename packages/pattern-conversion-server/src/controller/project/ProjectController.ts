import { Body, Controller, Get, Inject, Param, Post, Put, Query } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { ProjectService } from "../../service/project/ProjectService";
import { ConversionProjectDTO, CreateProjectDTO, QueryProjectDTO, RefreshProjectDTO, UpdateProjectDTO } from "../../dto/project";

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
     * @param {QueryProjectDTO} params 参数
     * @return
     * @memberof ProjectController
     */
    @Get('/projects')
    async getProjectList(@Query() params: QueryProjectDTO){
       const result = await this.projectService.getProjectList(params)
       return this.responseService.success(result)
    }

    
    /**
     * 获取图表统计，已废弃
     * 
     * @param {any} params 参数
     * @return
     * @memberof ProjectController
     */
    @Get('/projects/dashboard')
    async getProjectDashboard(@Query() params: any){
       const result = await this.projectService.getProjectDashboard(params)
       return this.responseService.success(result)
    }

    /**
     * 修改项目属性
     * 
     * @param {UpdateProjectDTO} params 参数
     * @return
     * @memberof ProjectController
     */
    @Put('/projects/:id')
    async updateProject(@Param('id') id: string | number, @Body() params: UpdateProjectDTO){
       const result = await this.projectService.updateProject(id,params)
       return this.responseService.success(result)
    }
    /**
     * 创建项目
     * 
     * @param {CreateProjectDTO} params 参数
     * @return
     * @memberof ProjectController
     */

    @Post('/projects')
    async createProject(@Body() params: CreateProjectDTO){
        // console.log('params',params);
        const result = await this.projectService.createProject(params)
        return this.responseService.success(result)
    }

    /**
     * 刷新项目
     * 
     * @param {RefreshProjectDTO} params 参数
     * @return
     * @memberof ProjectController
     */
    @Post('/projects/refresh',{summary: "refresh 项目"})
    async refreshProject(@Body() params: RefreshProjectDTO){
        // console.log('params',params);
        const result = await this.projectService.refreshProject(params)
        return this.responseService.success(result)
    }

    
    /**
     * 转换pattern
     * 
     * @param {ConversionProjectDTO} params 参数
     * @return
     * @memberof ProjectController
     */
    @Get('/projects/start_pattern_conversion')
    async conversonProject(@Query() params: ConversionProjectDTO){
        return await this.projectService.conversonProject()
    }

}