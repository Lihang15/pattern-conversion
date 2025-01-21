import { Provide } from "@midwayjs/core";
/**
 * @author xiaomeng.qin
 * @description 获取各个文件的文件名
 * @date 2025.1.10
 */

@Provide()
export class NamesService {

    /** 
    * by-group生成各个setup文件名
    * @param {string} groupName
    * @returns {Promise<string>} - 返回setup文件名
    */
    async coreStupFileName(groupName: string): Promise<string> {
        return groupName + '.setup'
    }

    async portConfigName(groupName: string): Promise<string> {
        return groupName + '_port_config.csv'
    }

    async renameSignals(groupName: string): Promise<string> {
        return groupName + '_rename_signals.csv'
    }

    async combinationsFileName(groupName: string): Promise<string> {
        return groupName + '_comb.txt'
    }
}