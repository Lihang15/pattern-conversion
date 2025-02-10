import { Body, Controller, Files, Get, Inject, Param, Post, Put, Query } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";
import { PatternGroupService } from "../../service/pattern/PatternGroupService";
import { PinPortConfigDTO, QueryPatternGroupDTO, SwitchGroupDTO, UpdatePatternGroupDTO, UploadSetupDTO } from "../../dto/patternGroup";
import { RuleType, Valid } from "@midwayjs/validate";
import { CoreSetupService } from "../../service/common/CoreSetupService";
import { UploadFileInfo, UploadMiddleware } from "@midwayjs/busboy";

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

    @Inject()
    coreSetupService: CoreSetupService
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

    /**
 * 获取pattern group info
 * 
 * @param {number} id groupId
 * @return
 * @memberof PatternGroupController
 */
    @Get('/project/pattern/group/:id')
    async getProjectPatternGroup(@Valid(RuleType.number().required()) @Param('id') id: number,){
        const result = await this.patternGroupService.getProjectPatternGroup(id)
        return this.responseService.success(result)
    }

    
    /**
     * 修改group属性
     * @param {number} id 项目id
     * @param {UpdatePatternGroupDTO} params 参数
     * @return
     * @memberof PatternGroupController
     */
    @Put('/project/pattern/group/:id')
    async updatePatternGroup(@Valid(RuleType.number().required()) @Param('id') id: number, @Body() params: UpdatePatternGroupDTO){
        const result = await this.patternGroupService.updatePatternGroup(id,params)
        return this.responseService.success(result)
    }

      /**
     * 验证Pin/Port Config等路径参数
     * 
     * @param {PinPortConfigDTO} params 参数
     * @return
     * @memberof PatternGroupController
     */
      @Post('/project/pattern/validate')
      async validateConfigPath(@Body() params: PinPortConfigDTO) {
          const result = await this.patternGroupService.validateConfigPath(params)
          return this.responseService.success(result)
      }
  
      /**
       * 切换pattern所属pattern group
       * 
       * @param {SwitchGroupDTO} params 参数
       * @return
       * @memberof PatternGroupController
       */
      @Put('/project/pattern')
      async switchGroup(@Body() params: SwitchGroupDTO) {
          const result = await this.patternGroupService.swtichGroup(params)
          return this.responseService.success(result)
      }
      
      /**
       * 上传setup文件
       * @param {UploadSetupDTO} params 参数
       * @param {UploadFileInfo} file  文件信息
       * @return
       * @memberof PatternGroupController
       */
      @Post('/project/pattern/setup/upload', { middleware: [UploadMiddleware] }) 
      async uploadSetup(@Query() params: UploadSetupDTO, @Files() files: Array<UploadFileInfo>) {
        console.log('params',params);
        
          const result = await this.coreSetupService.upload(params, files)
          return this.responseService.success(result)
      }
  
      /**
       * 下载setup模版文件
       * @param {DownloadSetupDTO} params 参数
       * @return
       * @memberof PatternGroupController
       */
      @Get('/project/pattern/setup/download')
      async downloadSetup() {
          await this.coreSetupService.download()
        //   return this.responseService.success(result)
      }
}