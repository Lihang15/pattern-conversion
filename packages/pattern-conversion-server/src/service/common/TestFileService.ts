import { Inject, Provide } from "@midwayjs/core";
import { PathService } from "../common/PathService"
import { NamesService } from "../common/NamesService";
import * as path from "path";
import * as ini from "ini";
import * as fs from "fs";
import { createObjectCsvWriter } from 'csv-writer';
import { UICoreSeupDTO } from "../../dto/coreSetup";
import * as childProcess from 'child_process';
import { PercentService } from "./PercentService";
import { CoreSetupService } from "./CoreSetupService";
import { UtilService } from "../common/UtilService";


type ResultInfo = {
    patName: string;
    result: string;
}

@Provide()
export class TestFileService {
    @Inject()
    pathService: PathService

    @Inject()
    namesService: NamesService

    @Inject()
    percentService: PercentService

    @Inject()
    coreSetupService: CoreSetupService

    @Inject()
    utilService: UtilService

    // async mkGroupDir(params: TmpDirDTO): Promise<any> {
    //     const { accountName, projectName, groupName } = params
    //     console.log(accountName, projectName, groupName)
    //     return await this.pathService.makeGroupDir(accountName, projectName, groupName)
    // }

    async run_conversion(): Promise<any>{
        const patDir = path.resolve(path.join(__dirname, '../../../source-patternfile'))
        // 待转的pattern list
        const patList = [
            {path: path.join(patDir, 'ZXxxxxxx_pll_bypass_v1.wgl'), groupName: 'GG'}, 
            {path: path.join(patDir, 'ZXxxxxxx_u0_ddr5_IIL_v2.wgl.gz'), groupName: 'GG'},
            {path: path.join(patDir, 'ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz'), groupName: 'GG'}
        ]
        let groupConfig = {
            G1: {enableTimingMerge: 0, wglPatList: [], stilPatList: []},
            G2: {enableTimingMerge: 0, wglPatList: [], stilPatList: []},
            G3: {enableTimingMerge: 0, wglPatList: [], stilPatList: []},
            GG: {enableTimingMerge: 1, wglPatList: [], stilPatList: []},
        }
        // 从数据库中找到pattern group对应的core setup
        const uiCoreSetup: UICoreSeupDTO = {
            optimize_drive_edges: 1,
            optimize_receive_edges: 1,
            // pattern_comments: 'on',
            // repeat_break: 0,
            // equation_based_timing: 1,
            // add_scale_spec: 0,
            // wgl_scan_in_padding: '0',
            // stil_pad_scanin: '0'
        };
        
        this.percentService.patCount = patList.length
        this.percentService.patIndex = 0
        let accountName = 'account'
        let projectName = 'project'
        let groupName = '';
        let setupDir: string = ''
        let setupName: string = ''
        let setupPath: string = ''
        let combinationsFile: string = ''
        let extname = 'WGL'
        for (const pat of patList) {
            groupName = pat.groupName
            extname = await this.utilService.getPatExtName(pat.path)
            if (extname === '.stil') {
                groupConfig[groupName].stilPatList.push(pat.path)
            } else if(extname === '.wgl') {
                groupConfig[groupName].wglPatList.push(pat.path)
            }
        }
        // 按照pattern group循环遍历执行pattern conversion
        let inputFiles: string = '';
        let inputFileType = 'WGL';
        let enableTimingMerge = 0;
        console.log(`There are ${this.percentService.patCount} patterns waiting to be converted.`)
        for (const group in groupConfig) {
            enableTimingMerge = groupConfig[group].enableTimingMerge
            // 如果enableTimingMerge为True, 则按照文件类型，一个group 只生成一个setup文件
            if (enableTimingMerge) {
                if (groupConfig[group].stilPatList.length > 0) {
                    inputFileType = 'STIL'
                    inputFiles = groupConfig[group].stilPatList.join(',')
                    setupDir = await this.pathService.makeGroupDir(accountName, projectName, group)
                    setupName = await this.namesService.coreStupFileName(group)
                    setupPath = path.join(setupDir, setupName)
                    combinationsFile = path.join(setupDir, await this.namesService.combinationsFileName(group))
                    this.coreSetupService.genSetup(setupPath, {
                      input_file_type: inputFileType, input_file_path: inputFiles, workdir: group, project_name: group,
                      combinations_file: combinationsFile
                        }, uiCoreSetup);
                    await this.runCore(setupPath)
                } else if (groupConfig[group].wglPatList.length > 0) {
                    inputFileType = 'WGL'
                    inputFiles = groupConfig[group].wglPatList.join(',')
                    console.log('inputFiles:' + inputFiles)
                    setupDir = await this.pathService.makeGroupDir(accountName, projectName, group)
                    setupName = await this.namesService.coreStupFileName(group)
                    setupPath = path.join(setupDir, setupName)
                    combinationsFile = path.join(setupDir, await this.namesService.combinationsFileName(group))
                    this.coreSetupService.genSetup(setupPath, {
                      input_file_type: inputFileType, input_file_path: inputFiles, workdir: group, project_name: group,
                      combinations_file: combinationsFile
                    }, uiCoreSetup);
                    await this.runCore(setupPath)
                }
            } else {
                // 每个stil pattern生成一个setup文件
                if (groupConfig[group].stilPatList.length > 0) {
                    inputFileType = 'STIL'
                    setupDir = await this.pathService.makeGroupDir(accountName, projectName, group)
                    for (const item of groupConfig[group].stilPatList) {
                        const stilName = path.basename(item, '.stil')
                        setupName = await this.namesService.coreStupFileName(stilName)
                        setupPath = path.join(setupDir, setupName)
                        this.coreSetupService.genSetup(setupPath, {
                          input_file_type: inputFileType, input_file_path: item, workdir: group, project_name: stilName
                        }, uiCoreSetup);
                        await this.runCore(setupPath)
                    }
                // 每个wgl pattern生成一个setup文件
                } else if (groupConfig[group].wglPatList.length > 0) {
                    inputFileType = 'WGL'
                    setupDir = await this.pathService.makeGroupDir(accountName, projectName, group)
                    for (const item of groupConfig[group].wglPatList) {
                        const wglName = await this.utilService.getPatBaseName(item)
                        setupName = await this.namesService.coreStupFileName(wglName)
                        setupPath = path.join(setupDir, setupName)
                        this.coreSetupService.genSetup(setupPath, {
                          input_file_type: inputFileType, input_file_path: item, workdir: group, project_name: wglName
                        }, uiCoreSetup);
                        await this.runCore(setupPath)
                        console.log(`The ${this.percentService.patIndex}th pattern conversion succcessfully`)
                    }
                }
            }
        }
    }

    async runCore(setupPath: string): Promise<any> {
        const cppExecutablePath = path.resolve(__dirname, '../../../cpp-core/bin-20241113/PatternReader.exe'); // C++ 程序路径
        const args = ['--setup', setupPath];
        const child = childProcess.spawn(cppExecutablePath, args);
        console.log('run command: ' + cppExecutablePath + ' ' + args)
        return new Promise((resolve, reject) => {
            child.on('error', (error) => {
                reject(error);
            });
            child.stdout.on('data', (data) => {
                // 处理core输出的日志文件
                console.log('子进程有输出:', data.toString());
                // 成功计数
                // this.percentService.addSuccessCnt()

            });
            child.on('exit', (code) => {
                if (code == 0) {
                    resolve(code)
                    // conversion 成功，更新进度
                    // 匹配到日志 start/result
                    this.percentService.addIndex()
                    const process = this.percentService.updataPercent()
                    console.log("Conversion process: " + process)
                } else {
                    reject(new Error(`Child process exited with code ${code}`));
                }
            });

          });
        
    }

    async readSetupTemplate(): Promise<boolean> {
        try {
            const setupPath = path.join(path.resolve(__dirname, '../../../cpp-core/template'), 'stil_to_8600.setup');
            const data = fs.readFileSync(setupPath, 'utf-8')
            const iniData = ini.parse(data)
            console.log(typeof iniData)
            console.log(iniData)
            return true
        } catch (error) {
            return false
        }

    }

    async writeConfig() {
        this.writeRenameSignalsCsv()
        this.writePortConfig()
    }

    async writeRenameSignalsCsv() {
        const data = [
            { wglsignalname: 'I_PCIe0_RST0_N', atesignalname: 'I_PCIE0_RST0_N' },
            { wglsignalname: 'I_PCIe0_RST1_N', atesignalname: 'I_PCIE0_RST1_N' },
            { wglsignalname: 'I_PCIe0_RST2_N', atesignalname: 'I_PCIE0_RST2_N' },
            { wglsignalname: 'io_ddr0_pad_mem_address[0]', atesignalname: 'DDR0_PAD_MEM_ADDRESS0' },
        ]

        const csvDir = path.resolve(__dirname, '../../../cpp-core')
        const csvWriter = createObjectCsvWriter({
            path: path.join(csvDir, 'groupName_rename_signals.csv'),
            header: [
                { id: 'wglsignalname', title: 'wgl signalname' },
                { id: 'atesignalname', title: 'ate signalname' }
            ],
        });

        csvWriter.writeRecords(data)
            .then(() => {
                console.log('CSV file has been written successfully')
            })
           .catch ((error) => {
                console.log('CSV file write failed')
           })
    }

    async writePortConfig() {
        const data = [
            { portName: 'port1', pins: 'pin1, pin2' },
            { portName: 'port2', pins: 'pin3, pin4' },
        ]

        const csvDir = path.resolve(__dirname, '../../../cpp-core')
        const csvWriter = createObjectCsvWriter({
            path: path.join(csvDir, 'groupName_port_config.csv'),
            header: [
                { id: 'portName', title: 'port name' },
                { id: 'pins', title: 'pins' }
            ],
        });

        csvWriter.writeRecords(data)
            .then(() => {
                console.log('CSV file has been written successfully')
            })
           .catch ((error) => {
                console.log('CSV file write failed')
           })
    }

    async matchTest() {
      const strCount = 'fileCount,2';
      const count = await this.matchCount(strCount);
      console.log("match fileCount: " + count)

      const strStart = 'start,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz'
      const startFile = await this.matchStart(strStart);
      console.log("match start conversion file name: " + startFile)

      const resultSuccess = 'result,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz successfully'
      const resultFailed = 'result,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz failed'
      const result1 = await this.matchResult(resultSuccess)
      const result2 = await this.matchResult(resultFailed)
      console.log(result1.patName + " conversion result :  " + result1.result)
      console.log(result2.patName + "conversion result : " + result2.result)
    }

    async matchCount(data: string): Promise<number> {
      // 匹配pattern文件总数
      // const str = 'fileCount,2';
      const regex = /fileCount,(\d+)/;
      const match = regex.exec(data);
      if (match && match.length > 1) {
        return parseInt(match[1], 10);
      }
      return -1;
    }

    async matchStart(data: string): Promise<string | null> {
      // 匹配如下格式字符串，查找开始转的pattern文件名
      // 'start,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz'
      const match = data.match(/start,(.+)$/)
      if (match && match.length > 1) {
        return match[1]
      }

      return null
    }

    async matchResult(data: string): Promise<ResultInfo | null> {
      // 匹配转换文件, 及conversion结果
      // 'result,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz successfully'
      // 'result,C:/Users/DELL/Desktop/pattern-tool/source-patternfile/ZXxxxxxx_u0_ddr5_VOH_v1.wgl.gz failed'
      const match = data.match(/result,(.+) (successfully|failed)$/)
      if (match && match.length > 2) {
        return {patName: match[1], result: match[2]}
      }
      return null
    }

}