import { Provide } from "@midwayjs/core";
import { promises as fs } from 'fs';
import * as path from 'path';
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
/**
 * @author xiaomeng.qin
 * @description 获取各个目录结构
 * @date 2025.1.10
 */

@Provide()
export class PathService {
    /**
       * 检查路径是否在文件系统中存在
       * @param {string} dirPath - 文件路径
       * @returns {boolean} 
       */
    async directoryExists(dirPath: string): Promise<boolean> {
        try {
            await fs.access(dirPath, fs.constants.F_OK); // 检查路径是否存在
            const stats = await fs.stat(dirPath); // 获取路径的状态信息
            return stats.isDirectory(); // 判断是否为目录
        } catch (error) {
            // 如果捕获到错误，说明路径不存在或者没有访问权限
            return false;
        }
    }

    /**
    * 创建指定dirName的目录
    * @param {string} dirName
    * @returns {void} - 
    */
    async makeDirs(dirName: string): Promise<void> {
        try {
            fs.mkdir(dirName, { recursive: true })
        } catch {
            throw new BusinessError(BusinessErrorEnum.MAKE_DIR_FAILED,'目录创建失败')
        }
    }

    /** 
    * 创建accoutName/projectName/groupName目录
    * @param {string} accountName
    * @param {string} projectName
    * @param {string} groupName
    * @returns {Promise<string>} - 返回创建的group目录
    */
    async makeGroupDir(accountName: string, projectName: string, groupName: string): Promise<string> {
        const coreDir = path.resolve(__dirname, '../../../cpp-core/platform-user-setup')
        
        if (!await this.directoryExists(coreDir)) {
            await this.makeDirs(coreDir)
        } 
        
        const groupDir = path.join(coreDir, accountName, projectName, groupName)
        if (!await this.directoryExists(groupDir)) {
            await this.makeDirs(groupDir)
        } 
        return groupDir
    }

}



