import { Provide, Inject } from "@midwayjs/core";
import * as path from "path";
import * as dayjs from 'dayjs';
import {promises as fs} from 'fs';
import { promises as fsPromises } from 'fs';
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { NamesService } from "./NamesService";
import { PathService } from "./PathService"
/**
 * @author xiaomeng.qin
 * @description 通用函数
 * @date 2025.1.16
 */

type PatGroupInfo = {
  path: string;
  fileName: string;
  groupName: string;
  mtime: string  //pattern文件最后一次修改时间
}

type SetupConfig = {
  Common: object
}
type GroupConfig = {
  groupName: string;
  enableTimingMerge: boolean;
  wglPatPath: string[];
  stilPatPath: string[];
  setupPath: string;
  setupConfig: SetupConfig;
}

@Provide()
export class UtilService {
  @Inject()
  pathService: PathService
  
  @Inject()
  namesService: NamesService

  // 获取文件后缀名
  async getPatExtName(filePath: string, removeGz: boolean = true): Promise<string>{
    const ext = path.extname(filePath)
    if (ext === '.gz' && removeGz) {
        return path.extname(path.basename(filePath, ext))
    }
    return ext
  }

  // 获取pattern文件去掉gz和后缀名的base name
  async getPatBaseName(filePath: string, remobeGz: boolean = true): Promise<string> {
    const ext = path.extname(filePath)
    if (ext === '.gz' && remobeGz) {
        const newName = path.basename(filePath, ext)
        return path.basename(newName, path.extname(newName))
    }
    return path.basename(filePath, ext)
  }

  async getPatMTime(): Promise<any> {
    const patDir = path.resolve(__dirname, "../../../source-patternfile")
    // const patFiles = ['ZXxxxxxx_pll_bypass_v1.wgl', 'ZXxxxxxx_u0_ddr5_IIL_v2.wgl.gz', 'ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz']
    const patPath = path.join(patDir, 'ZXxxxxxx_pll_bypass_v1.wgl')
    fsPromises.stat(patPath)
        .then((stats) => {
            const mtime = stats.mtime;
            const formattedTime = dayjs(mtime).format('YYYYMMDDHHmmss')
            console.log(patPath, '文件修改时间为:', formattedTime)
            return formattedTime
        })
        .catch((error) => {
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, "获取文件修改时间错误")
        })
  }

  async test(): Promise<any> {
    // const inputDir = `C:\source-patternfile`
    // const groupInfoList = await this.getPatGroupInfo(inputDir)
    // this.getGroupConfig(groupInfoList)
  }

  // UI上展示的参数的默认值
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

  // 当前conversion core 仅支持后缀名为 .wgl/.wgl.gz/.stil/.stil.gz格式的pattern文件
  // 后续增加了vcd/evcd支持后，需要将后缀名添加到validExt
  async isValidPat(patPath: string): Promise<boolean> {
    const extName = await this.getPatExtName(patPath)
    const validExt = ['.stil', '.wgl', '.stil.gz', '.wgl.gz']
    if (validExt.includes(extName)) {
      return true;
    }
    return false;
  }

  // 根据输入路径得到所有patten文件及其默认的pattern group name
  // 若输入路径下有第一级子目录，则第一级子目录名称是pattern group name
  // 若输入路径下没有第一级子目录，则pattern base name 是 pattern group name
  async getPatGroupInfo(dirPath: string, recursive: boolean = true): Promise<PatGroupInfo[]> {
    let groupInfoList = [];
    const items = await fs.readdir(dirPath);
    let groupName = ''
    for (const item of items) {
      const itemPath = path.join(dirPath, item); // 拼接当前路径
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory() && recursive) {
        groupName = item
        groupInfoList = groupInfoList.concat(await this.scanPatSubDir(itemPath, item, true));
      } else if (stat.isFile() && await this.isValidPat(item)) {
        // 标准化路径，转换为跨平台的统一格式
        const normalizedPath = path.normalize(itemPath);
        // 输入路径下的patten文件的pattern group name是base pattern name
        groupName = await this.getPatBaseName(item)
        groupInfoList.push({ path: normalizedPath, fileName: item, groupName: groupName, mtime: dayjs(stat.mtime).valueOf().toString() })
      }
    }

    // console.log(groupInfoList)

    return groupInfoList;
  }

// groupName 已经固定，递归遍历项目输入路径下的子目录
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
      const mtime = dayjs(stat.mtime).valueOf().toString()
      groupInfoList.push({ path: normalizedPath, fileName: item, groupName: groupName, mtime: mtime })
    }
  }

  return groupInfoList
}

  async getGroupConfig(groupInfoList: PatGroupInfo[],accountName:string, projectName: string ): Promise<GroupConfig[]> {
    // 测试数据
    // let accountName = 'account'
    // let projectName = 'project'
    let groupName = ''
    let patPath = ''
    let setupDir = ''
    let setupPath = ''
    let enableTimingMerge = false
    let groupConfigList = []
    let groupConfig = {}
    let extname = ''

    // 得到group 和 group下的pattern list的对应关系
    for (const item of groupInfoList) {
      groupName = item.groupName
      patPath = item.path
      extname = await this.getPatExtName(patPath)
      if (!(groupName in groupConfig)) {
        groupConfig[groupName] = {'wglPatPathList': [], 'stilPatPathList': []}
        // 'enableTimingMerge'的值应该从UI上用户的配置来设置
        groupConfig[groupName]['enableTimingMerge'] = false
      }
      if (extname == '.wgl') {
        groupConfig[groupName]['wglPatPathList'].push(patPath)
      } else {
        groupConfig[groupName]['stilPatPathList'].push(patPath)
      }
      
    }
    for (groupName in groupConfig) {
      setupDir = await this.pathService.makeGroupDir(accountName, projectName, groupName)
      enableTimingMerge = groupConfig[groupName]['enableTimingMerge']
      setupPath = path.join(setupDir, await this.namesService.coreStupFileName(groupName))
      groupConfigList.push({groupName: groupName, 
        enableTimingMerge: enableTimingMerge, 
        wglPatPath: groupConfig[groupName]['wglPatPathList'],
        stilPatPath: groupConfig[groupName]['stilPatPathList'],
        setupPath: setupPath,
        setupConfig: await this.defaultCoreSetupConfig()
      });
    }

    // console.log(groupConfigList)

    return groupConfigList
  }

}