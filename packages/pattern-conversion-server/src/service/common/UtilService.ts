import { Provide, Inject } from "@midwayjs/core";
import * as path from "path";
import * as dayjs from 'dayjs';
import { promises as fs } from 'fs';
import * as XLSX from 'xlsx';
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { NamesService } from "./NamesService";
import { PathService } from "./PathService"
import { ILogger } from "@midwayjs/logger";
/**
 * @author xiaomeng.qin
 * @description 通用函数
 * @date 2025.1.16
 */

export type PatGroupInfo = {
  path: string;
  fileName: string;
  groupName: string;
  format: string; // pattern文件的后缀名
  mtime: string  //pattern文件最后一次修改时间
}

type SetupConfig = {
  Common: object
}
export type SetupPath = {
  wglSetupPath: string,
  stilSetupPath: string,
}
type GroupConfig = {
  groupName: string;
  enableTimingMerge: boolean;
  wglPatPath: string[];
  stilPatPath: string[];
  setupPath: SetupPath;
  setupConfig: SetupConfig;
}

@Provide()
export class UtilService {
  @Inject()
  pathService: PathService
  
  @Inject()
  namesService: NamesService

  @Inject()
  logger: ILogger

  /**
   * 获取文件后缀名
   * @param {string} filePath 文件全路径
   * @param {boolean} removeGz 是否去掉'.gz'
   * @returns {string} 文件的后缀名
   */
  async getPatExtName(filePath: string, removeGz: boolean = true): Promise<string>{
    const ext = path.extname(filePath)
    if (ext === '.gz' && removeGz) {
        return path.extname(path.basename(filePath, ext))
    }
    return ext
  }

  /**
   * 获取pattern文件去掉gz和后缀名的base name
   * @param {string} filePath 文件全路径
   * @param {boolean} removeGz 是否去掉'.gz'
   * @returns {string} 文件去掉后缀名的base name
   */
  async getPatBaseName(filePath: string, remobeGz: boolean = true): Promise<string> {
    const ext = path.extname(filePath)
    if (ext === '.gz' && remobeGz) {
        const newName = path.basename(filePath, ext)
        return path.basename(newName, path.extname(newName))
    }
    return path.basename(filePath, ext)
  }

  /**
   * 获取pattern文件修改时间
   * @param {string} filePath 文件全路径
   * @returns {string} 文件的修改时间
   */
  async getPatMTime(filePath: string): Promise<string> {
    try {
      const stats = await fs.stat(filePath);
      return (dayjs(stats.mtime).valueOf().toString())
    }catch (error) {
      throw new BusinessError(BusinessErrorEnum.NOT_FOUND, "获取文件修改时间错误");
    }
  }

  /**
   * 获取UI上展示的参数的默认值
   *
   * @returns {} UI展示参数默认值对象
   */
  async defaultCoreSetupConfig(): Promise<any> {
    const defaultConfig = {
      Common: {
        'port_config' : '',
        'rename_signals' : '',
        'exclude_signals' : '',
        'optimize_drive_edges' : 1,
        'optimize_receive_edges' : 1,
        'pattern_comments' : 'on',
        'repeat_break' : 0,
        'equation_based_timing' : 1,
        'add_scale_spec' : 0,
        'label_suffix' : '',
      }
    }
    return defaultConfig;
  }

  /**
   * 根据pattern文件后缀名判断是否当前cpp core支持的合法pattern 文件
   * 当前conversion core 仅支持后缀名为 .wgl/.wgl.gz/.stil/.stil.gz格式的pattern文件
   * 后续增加了vcd/evcd支持后，需要将后缀名添加到validExt
   * @param {string} filePath 文件全路径
   * @returns {boolean} true: 为支持的pattern文件； false: 为不支持的pattern文件
   */
  async isValidPat(patPath: string): Promise<boolean> {
    const extName = await this.getPatExtName(patPath)
    const validExt = ['.stil', '.wgl', '.stil.gz', '.wgl.gz']
    if (validExt.includes(extName)) {
      return true;
    }
    return false;
  }

  /**
   * 根据输入路径得到所有patten文件及其默认的pattern group name
   * 若输入路径下有第一级子目录，则第一级子目录名称是pattern group name
   * 若输入路径下没有第一级子目录，则pattern base name 是 pattern group name
   * @param {string} dirPath 项目的输入路径
   * @param {boolean} recursive 是否递归遍历
   * @returns {PatGroupInfo[]} 输入路径下pattern文件的group相关信息
   */
  async getPatGroupInfo(dirPath: string, recursive: boolean = true): Promise<PatGroupInfo[]> {
    if (!await this.pathService.directoryExists(dirPath)) {
      throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'项目的输入目录不存在')
    }
    let groupInfoList = [];
    const items = await fs.readdir(dirPath);
    let groupName = ''
    try {
      for (const item of items) {
        const itemPath = path.join(dirPath, item); // 拼接当前路径
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory() && recursive) {
          groupName = item
          groupInfoList = groupInfoList.concat(await this.scanPatSubDir(itemPath, item, true));
        } else if (stat.isFile() && await this.isValidPat(item)) {
          // 标准化路径，转换为跨平台的统一格式
          const normalizedPath = path.normalize(itemPath);
          const extName = await this.getPatExtName(itemPath)
          const patFormat = await this.getPatFormat(extName)
          // 输入路径下的patten文件的pattern group name是base pattern name
          groupName = await this.getPatBaseName(item)
          groupInfoList.push({ path: normalizedPath, fileName: item, groupName: groupName, 
            format: patFormat,
            mtime: dayjs(stat.mtime).valueOf().toString() });
        }
      }
      return groupInfoList;
    } catch(error) {
      this.logger.error(error)
      throw {
          message: 'Fail to get pattern group information'
      }
    }
  }

  /**
   * 根据groupName 已经固定，递归遍历项目输入路径下的子目录
   * @param {string} dirPath 项目的输入路径的子目录
   * @param {string} groupName pattern group name
   * @param {boolean} recursive 是否递归遍历, V1.0-0版本仅支持输入目录下的第一级子目录
   * @returns {PatGroupInfo[]} 输入路径下pattern文件的group相关信息
   */
  async scanPatSubDir(dirPath: string, groupName: string, recursive: boolean = true): Promise<PatGroupInfo[]> {
    let groupInfoList = [];
    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory() && recursive) {
        groupInfoList = groupInfoList.concat(await this.scanPatSubDir(itemPath, groupName, true));
      } else if (stat.isFile() && await this.isValidPat(item)) {
        // 标准化路径，转换为跨平台的统一格式
        const normalizedPath = path.normalize(itemPath);
        const extName = await this.getPatExtName(itemPath);
        const patFormat = await this.getPatFormat(extName);
        const mtime = dayjs(stat.mtime).valueOf().toString()
        groupInfoList.push({ path: normalizedPath, fileName: item, groupName: groupName, 
          format: patFormat, mtime: mtime })
      }
    }

    return groupInfoList
  }

  /**
   * 获取group相关配置信息
   * @param {PatGroupInfo[]} groupInfoList group 相关配置信息
   * @param {string} accountName 
   * @param {string} projectName
   * @returns {GroupConfig[]} group相关配置信息
   */
  async getGroupConfig(groupInfoList: PatGroupInfo[], accountName:string, projectName: string ): Promise<GroupConfig[]> {
    // 若一个pattern group中同时有wgl和stil类型pattern文件，则需要需要生成两个setup文件：wgl setup 和 stil setup
    // let groupName = ''
    let patPath = ''
    let setupDir = ''
    let enableTimingMerge = false
    let groupConfigList = []
    let groupConfig = {}
    let extname = ''

    // 得到group 和 group下的pattern list的对应关系
    for (const item of groupInfoList) {
      const groupName = item.groupName
      patPath = item.path
      extname = await this.getPatExtName(patPath)
      if (!(groupName in groupConfig)) {
        groupConfig[groupName] = {'wglPatPathList': [], 'stilPatPathList': []}
        // 'enableTimingMerge'的值默认为false
        groupConfig[groupName]['enableTimingMerge'] = false
      }
      if (extname == '.wgl') {
        groupConfig[groupName]['wglPatPathList'].push(patPath)
      } else {
        groupConfig[groupName]['stilPatPathList'].push(patPath)
      }
    }
    for (const groupNameKey in groupConfig) {
      setupDir = await this.pathService.makeGroupDir(accountName, projectName, groupNameKey)
      enableTimingMerge = groupConfig[groupNameKey]['enableTimingMerge']
      // setupPath = path.join(setupDir, await this.namesService.coreStupFileName(groupName))
      const setupPath: SetupPath = {wglSetupPath: '', stilSetupPath: ''};
      if (groupConfig[groupNameKey]['wglPatPathList'].length > 0){
        setupPath.wglSetupPath = path.join(setupDir, await this.namesService.coreStupFileName(groupNameKey, 'WGL'))
      }
      if (groupConfig[groupNameKey]['stilPatPathList'].length > 0) {
        setupPath.stilSetupPath = path.join(setupDir, await this.namesService.coreStupFileName(groupNameKey, 'STIL'))
      }
      groupConfigList.push({groupName: groupNameKey, 
        enableTimingMerge: enableTimingMerge, 
        wglPatPath: groupConfig[groupNameKey]['wglPatPathList'],
        stilPatPath: groupConfig[groupNameKey]['stilPatPathList'],
        setupPath: setupPath,
        setupConfig: await this.defaultCoreSetupConfig()
      });
    }
    return groupConfigList
  }

  /**
   * 解析上传的core setup文件中的配置信息
   * @param {string} filePath 上传的core setup文件
   * @returns {GroupConfig[]} core setup配置信息
   */
  async parseXLSXCoreSetup(filePath: string): Promise<Object> {
    if (!this.pathService.fileExists(filePath)){
      throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'Core setup文件不存在')
    }
    try {
      const workbook = XLSX.readFile(filePath)
      const sheetNames = workbook.SheetNames
      const firstSheetName = sheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)
      const result = {}
      for(const line of data) {
        if (line['Parameters']){
          const paramName = line['Parameters']
          if (line['Value'] !== undefined){
            if (paramName in ['repeat_break', 'optimize_drive_edges', 'optimize_receive_edges', 
              'equation_based_timing', 'add_scale_spec']){
              result[paramName] = parseInt(line['Value'])
            } else{
              result[paramName] = line['Value']
            }
          } else{
            result[paramName] = ''
          }
        }
      }
      return result
    } catch(error) {
      this.logger.error(error)
      throw {
          message: 'Fail to parse core setup file'
      }
    }
  }

  /**
   * 合并两个文件映射对象
   * @param target 目标文件映射
   * @param source 源文件映射
   */
  async mergeFileMaps(target: Record<string, string[]>, source: Record<string, string[]>) {
    for (const [fileName, filePaths] of Object.entries(source)) {
      if (!target[fileName]) {
        target[fileName] = [];
      }
      target[fileName].push(...filePaths);
    }
  }

  /**
   * 遍历目录并返回文件映射
   * @param currentPath 当前目录路径
   * @param recursive 是否递归遍历子目录
   * @returns 返回文件映射对象，键是文件名，值是文件路径数组
   */
  async walkDirectory(
    currentPath: string,
    recursive: boolean = true
  ): Promise<Record<string, string[]>> {
    const fileMap: Record<string, string[]> = {};
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        // 如果是目录，且需要递归遍历
        if (recursive) {
          // 递归调用 walkDirectory，并合并结果
          const subDirFileMap = await this.walkDirectory(itemPath, recursive);
          await this.mergeFileMaps(fileMap, subDirFileMap);
        }
      } else if (item.isFile() && await this.isValidPat(item.name)) {
        // const fileName = await this.getPatBaseName(item.name);
        const fileNameRemoveGz = ((fileName: string) => {
                                    return fileName.endsWith('.gz') ? fileName.slice(0, -3) : fileName;
                                  })(item.name); // 去掉 .gz 后缀名

          // 记录文件路径
          if (!fileMap[fileNameRemoveGz]) {
            fileMap[fileNameRemoveGz] = [];
          }
          fileMap[fileNameRemoveGz].push(itemPath);
      }
    }

    return fileMap;
  }
  
  /**
   * 检查输入目录下是否有重名的pattern文件
   * @param dirPath 要检查的目录路径
   * @param recursive 是否递归遍历子目录
   * @returns 返回一个对象，键是文件名，值是文件路径数组（如果有重名文件）
  */
  async findDuplicateFilesAsync(dirPath: string, recursive: boolean = true): Promise<Record<string, string[]>> {
    // 调用 walkDirectory 获取文件映射
    const fileMap = await this.walkDirectory(dirPath, recursive);

    // 过滤出重名文件
    const duplicates: Record<string, string[]> = {};
    for (const [fileName, filePaths] of Object.entries(fileMap)) {
      if (filePaths.length > 1) {
        duplicates[fileName] = filePaths;
      }
    }

    return duplicates;
  }

  // 格式化数据库中记录的时间
  async formatRecordTimestamps(record): Promise<any> {
    if (!record) {
      return record;
    }
  
    // 格式化时间字段
    if (record.createdAt) {
      record.createdAt = dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss');
    }
    if (record.updatedAt) {
      record.updatedAt = dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss');
    }
    if (record.deletedAt) {
      record.deletedAt = dayjs(record.deletedAt).format('YYYY-MM-DD HH:mm:ss');
    }
  
    return record;
  }

  // 获取pattern 文件的format: STIL/WGL, 同setup文件中的input_file_type中的值保持一致
  async getPatFormat(patExtName: string): Promise<string>{
    const patFormatMap = new Map<string, string>([
      ['.wgl', 'WGL'],
      ['.wgl.gz', 'WGL'],
      ['.stil', 'STIL'],
      ['.stil.gz', 'STIL'],
    ]);
    const patFormat = patFormatMap.get(patExtName);
    if (patFormat) {
        return patFormat;
    } else {
        throw new BusinessError(BusinessErrorEnum.NOT_FOUND, `Unknown pattern ext name: ${patExtName}`);
    }
  }

}