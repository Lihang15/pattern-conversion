import { Provide } from "@midwayjs/core";

/**
 * 项目服务层
 * @author lihang.wang
 * @date 2024.11.11
 */
@Provide()
export class ProjectService{

    async getProjectList():Promise<any>{
        let result = [{projectName:'项目1'},{projectName:'项目2'}]
        return result
    }

    async creatProject(dirPath: string){
        
    }

}