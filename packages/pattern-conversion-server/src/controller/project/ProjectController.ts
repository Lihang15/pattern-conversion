import { Controller, Get, Inject } from "@midwayjs/core";
import { ResponseService } from "../../service/common/ResponseService";


@Controller('/api/project')
export class ProjectController{
    @Inject()
    responseService: ResponseService
    @Get('/list')
    getProjectList(){
       return this.responseService.success([{projectName:'项目1'},{projectName:'项目2'}])
    }

}