import { Provide } from "@midwayjs/core";
import * as fs from 'fs';
import * as path from 'path';
/**
 * @author lihang.wang
 * @description 处理当前pc文件系统
 * @date 2024.11.11
 */
@Provide()
export class PcSystemFileService{
    /**
     * 通过传入目录路径，获取目录下的所有文件路径
     * @param dirPath 文件夹路径
     * @memberof PcSystemFileService 
     */
   async getFilePaths(dirPath: string): Promise<String[]>{
      let fileList = []
      // 读取目录内容
      const items = fs.readdirSync(dirPath)
      for(const item of items){
        const itemPath = path.join(dirPath,item);
        const stat = fs.statSync(itemPath)
        if(stat.isDirectory()){
            // 是目录开始递归
            fileList = fileList.concat(this.getFilePaths(itemPath))
        }else if(stat.isFile()){
            // 是文件
            fileList.push(itemPath)
        }
      }
      return fileList
   }
}