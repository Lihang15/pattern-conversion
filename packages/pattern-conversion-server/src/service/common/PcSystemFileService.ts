import { Provide } from "@midwayjs/core";
import {promises as fs} from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dayjs = require("dayjs");
/**
 * @author lihang.wang
 * @description 处理当前pc文件系统
 * @date 2024.12.3
 */
type FileInfo = {
  path: string;
  fileName: string;
  md5?: string;
  mtime?: string //文件最后一次修改时间
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
          fileList.push({ path: normalizedPath, fileName: item, mtime: dayjs(stat.mtime).valueOf().toString(), md5 });
        } else {
          fileList.push({ path: normalizedPath, fileName: item, mtime: dayjs(stat.mtime).valueOf().toString() });
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

  /**
   * 检查输出路径的盘符是否在文件系统中存在
   * @param {string} outputPath - 文件路径
   * @returns {boolean} 
   */
  async isValidOutputRootDir(outputPath: string): Promise<boolean> {
    if (path.isAbsolute(outputPath)){
      const parsedPath = path.parse(outputPath);
      const root = parsedPath.root ? parsedPath.root.slice(0, 2) : null;
      // 正则匹配确保盘符格式正确
      if (root.match(/^[A-Za-z]:/)){
        const rootPath = path.join(root, '\\');
        return this.directoryExists(rootPath)
      } else{
        return false;
      }
    } else{
      return true;
    }
  }

  /**
   * 判断输出目录是否是输入目录的子目录或与输入目录相同
   * @param inputDir 输入目录
   * @param outputDir 输出目录
   * @returns boolean
   */
  async isOutputDirInvalid(inputDir: string, outputDir: string): Promise<boolean> {
    // 规范化路径，解决路径中的 `..` 和 `.` 等问题
    const normalizedInputDir = path.normalize(inputDir);
    const normalizedOutputDir = path.normalize(outputDir);

    // 判断输出目录是否与输入目录相同
    if (normalizedInputDir === normalizedOutputDir) {
      return true;
    }

    // 判断输出目录是否是输入目录的子目录
    const relativePath = path.relative(normalizedInputDir, normalizedOutputDir);
    return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
  }
    /**
   * 删除路径
   * @param filePath 文件路径
   * @returns 是否删除成功
   */
    async deletePath(filePath: string): Promise<boolean> {
      try {
        const stats = await fs.lstat(filePath);
  
        if (stats.isDirectory()) {
          // 如果是目录，递归删除
          await fs.rm(filePath, { recursive: true });
        } else {
          // 如果是文件，直接删除
          await fs.unlink(filePath);
        }
  
        return true;
      } catch (error) {
        return false;
      }
    }
  
    /**
     * 判断路径是否存在，如果存在则删除
     * @param filePath 文件路径
     * @returns 是否删除成功
     */
    async deletePathIfExists(filePath: string): Promise<boolean> {
      const exists = await this.directoryExists(filePath);
      if (exists) {
        return await this.deletePath(filePath);
      }
      return false;
    }
}