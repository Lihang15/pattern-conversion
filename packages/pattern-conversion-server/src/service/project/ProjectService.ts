import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import * as childProcess from 'child_process';
import * as path from 'path';

/**
 * 项目服务层
 * @author lihang.wang
 * @date 2024.11.11
 */
@Provide()
export class ProjectService{

    @Inject()
    ctx: Context

    async getProjectList():Promise<any>{
        let result = [{projectName:'项目1'},{projectName:'项目2'}]
        return result
    }

    async creatProject(dirPath: string){
        
    }
    /**
     * 调用cpp-core开始转换
     */
    async startConverson(){
        const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20241113/PatternReader.exe'); // C++ 程序路径
        const args = ['--setup',path.resolve(__dirname,'../../../cpp-core/bin-20241113/config.setup') ]
        // 执行 C++ 程序并获取输出
        const child = childProcess.spawn(cppExecutablePath, args);
    
        // 创建一个异步生成器，推送日志给前端
        this.ctx.respond = false; // 关闭默认响应
        this.ctx.set('Content-Type', 'text/event-stream');
        this.ctx.set('Cache-Control', 'no-cache');
        this.ctx.set('Connection', 'keep-alive');
        this.ctx.status = 200;
        let process = 0
        // 每当 C++ 程序输出一行日志时，推送给前端
        child.stdout.on('data', (data) => {
          let count = 10
          const current_process = 1/count
          process = process+current_process
          const logMessage = data.toString();
          if(true){
            // 如果读到 文件名，successfully
            // 1.更新db状态

            //2.返回process
            this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
          }
          if(true){
            // 如果读到 文件名，error
            // 1.更新db状态，记录errorlog
            //2.返回process
            this.ctx.res.write(`data: ${logMessage}\n\n, process: ${process}`);
          }
          
        });
    
        // 处理 C++ 程序的错误输出
        child.stderr.on('data', (data) => {
          const errorMessage = data.toString();
          this.ctx.res.write(`data: ${errorMessage}\n\n`);
        });
    
        // 处理 C++ 程序结束时
        child.on('close', (code) => {
          if (code === 0) {
            // process 更新为100
            this.ctx.res.write('data: Conversion completed successfully.\n\n');
          } else {
            this.ctx.res.write(`data: Conversion failed with code ${code}.\n\n`);
          }
          this.ctx.res.end(); // 结束响应
        });
    
    }

}