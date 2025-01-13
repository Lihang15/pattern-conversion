import { Controller, Get, Inject, Query } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { PatternGroupService } from "../../service/pattern/PatternGroupService";

/**
 * pattern和group控制器
 * @author lihang.wang
 * @date 2024.1.10
 */
@Controller('/api')
export class PatternGroupController{
    @Inject()
    responseService: ResponseService
    @Inject()
    patternGroupService: PatternGroupService

     /**
     * 获取pattern列表
     * @memberof ProjectController
     */
    @Get('/project/pattern')
    async getProjectPatternList(@Query() params: any){
       const result = await this.patternGroupService.getProjectPatternList(params)
       return this.responseService.success(result)
    }
}