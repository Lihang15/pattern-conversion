import { Controller, Get, Inject, Query } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { PatternGroupService } from "../../service/pattern/PatternGroupService";
import { QueryPatternGroupDTO } from "../../dto/patternGroup";

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
     * 获取pattern list
     * 
     * @param {QueryPatternGroupDTO} params 参数
     * @return
     * @memberof PatternGroupController
     */
    @Get('/project/pattern')
    async getProjectPatternList(@Query() params: QueryPatternGroupDTO){
       const result = await this.patternGroupService.getProjectPatternList(params)
       return this.responseService.success(result)
    }
}