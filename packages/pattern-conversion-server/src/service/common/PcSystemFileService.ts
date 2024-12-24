import { Provide } from "@midwayjs/core";
import {promises as fs} from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
/**
 * @author lihang.wang
 * @description 处理当前pc文件系统
 * @date 2024.12.3
 */
type FileInfo = {
  path: string;
  fileName: string;
  md5?: string;
}
@Provide()
export class PcSystemFileService {
  /**
   * 通过传入目录路径，获取目录下的所有文件路径
   * @param {string} dirPath 文件夹路径
   * @returns {FileInfo[]} 文件的 MD5 值
   */
  async getFilePaths(dirPath: string, recursive: boolean = false, isGetMd5: boolean = false): Promise<FileInfo[]> {
    let fileList = [];

    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item); // 拼接当前路径
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory() && recursive) {
        fileList = fileList.concat(await this.getFilePaths(itemPath, true, isGetMd5));
      } else if (stat.isFile()) {
        // 标准化路径，转换为跨平台的统一格式
        const normalizedPath = path.normalize(itemPath);

        if (isGetMd5) {
          const md5 = await this.getFileMd5(itemPath);
          fileList.push({ path: normalizedPath, fileName: item, md5 });
        } else {
          fileList.push({ path: normalizedPath, fileName: item });
        }
      }
    }

    return fileList;
  }

    /**
   * 计算文件的 MD5 值
   * @param {string} filePath - 文件路径
   * @returns {string} 文件的 MD5 值
   */
  async getFileMd5(filePath: string): Promise<string> {
    const hash = crypto.createHash('md5');
    const fileBuffer = await fs.readFile(filePath);
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

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
   * 检查文件或目录是否存在
   * @param {string} path - 文件或目录路径
   * @returns {Promise<boolean>} - 返回布尔值表示是否存在
   */
  async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path, fs.constants.F_OK); // 检查路径是否存在
      return true;
    } catch {
      return false; // 路径不存在或无权限访问
    }
  }
  
}