import { Inject, Provide } from "@midwayjs/core";
import * as ini from "ini";
import * as fs from "fs";
import { CoreSetupDTO, UICoreSetupDTO } from "../../dto/coreSetup";
import { BusinessError, BusinessErrorEnum, FailReason } from "../../error/BusinessError";
import { Valid } from "@midwayjs/validate";
import { ILogger } from "@midwayjs/logger";
import { UtilService } from "./UtilService";
import { PinPortConfigDTO, UploadSetupDTO } from "../../dto/patternGroup";
import { UploadFileInfo } from '@midwayjs/busboy';
import { Group } from "../../entity/postgre/group";
import { Context } from "@midwayjs/koa";
import * as path from 'path';
import { PatternGroupService } from "../pattern/PatternGroupService";

@Provide()
export class CoreSetupService {
    @Inject()
    ctx: Context;
    @Inject()
    logger: ILogger
    @Inject()
    utilService: UtilService
    @Inject()
    patternGroupService: PatternGroupService

    async genSetup(setupPath: string, @Valid() coreSetup: CoreSetupDTO): Promise<boolean> {
        const setupData = {
            Common:{},
            WGL:{},
            STIL:{}};
        // 设置UI上配置的参数
        try {
            for (const paramName in coreSetup) {
                if (coreSetup.hasOwnProperty(paramName)) {
                    const section = await this.getParamSection(paramName);
                    setupData[section][paramName] = coreSetup[paramName];
                }
            }
            const iniString = ini.encode(setupData);
            fs.writeFileSync(setupPath, iniString);
            return true
        } catch(error){
            this.logger.error(error)
            throw new BusinessError(BusinessErrorEnum.UNKNOWN, "Failed to generate setup file")
        }
    }

    async getParamSection(paramName: string): Promise<string> {
        const paramSectionMap = new Map<string, string>([
            // Common parameters
            ['input_file_type', 'Common'],
            ['input_file_path', 'Common'],
            ['workdir', 'Common'],
            ['project_name', 'Common'],
            ['port_config', 'Common'],
            ['rename_signals', 'Common'],
            ['combinations_file', 'Common'],
            ['exclude_signals', 'Common'],
            ['optimize_drive_edges', 'Common'],
            ['optimize_receive_edges', 'Common'],
            ['waveformtable_name', 'Common'],
            ['equationset_name', 'Common'],
            ['specificationset_name', 'Common'],
            ['pattern_comments', 'Common'],
            ['signal_timing_mapping', 'Common'],
            ['repeat_break', 'Common'],
            ['equation_based_timing', 'Common'],
            ['add_scale_spec', 'Common'],
            ['label_suffix', 'Common'],
            ['level_specification_set', 'Common'],
            ['level_equation_set', 'Common'],
            ['level_set', 'Common'],
        
            // WGL parameters
            ['wgl_scan_in_padding', 'WGL'],
            ['wgl_scan_output_padding', 'WGL'],
            ['wgl_purge_unused_timeplates', 'WGL'],
            ['wgl_purge_unused_waveforms', 'WGL'],
            ['wgl_add_drive_off', 'WGL'],
        
            // STIL parameters
            ['stil_pattern_exec', 'STIL'],
            ['stil_pad_scanin', 'STIL'],
            ['stil_pad_scanout', 'STIL'],
        ]);
        const section = paramSectionMap.get(paramName);
        if (section) {
            return section;
        } else {
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, `Unknown setup parameter: ${paramName}`);
        }
    }

    /**
    * 上传setup参数文件
    * @param {UploadSetupDTO} params
    * @param {Array<UploadFileInfo>} files 上传的文件列表
    * @returns true/false 上传是否成功
    */
    async upload(params: UploadSetupDTO, files: Array<UploadFileInfo>): Promise<boolean> {
        const { projectId, groupId } = params
        const groupExist = await Group.findOne({
            where: {
                id: groupId,
                projectId: projectId
            },
            raw: false
        });
        if (!groupExist) {
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, 'Pattern group不存在')
        }
        if (files.length <= 0){
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, "没有上传core setup参数文件");
        }
        const filePath = files[0].data
        // 解析上传的setup文件
        const setup = await this.utilService.parseXLSXCoreSetup(filePath)
        // 对参数值进行合法性校验
        const validSetup = await this.validataSetup(setup as UICoreSetupDTO)

        // 验证 pin/port/sign3个路径的合法性<如果有> 再入库，路径不在系统中 上传失败
        if(validSetup.exclude_signals){
            if(!await this.patternGroupService.
                validateConfigPath({excludeSignalsPath: validSetup.exclude_signals.replace(/\\/g, '\\\\')} as PinPortConfigDTO)){
                    throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailReason.INVALID_EXCLUDE_SIGNALS_PATH}`);
                }
        }
        if(validSetup.port_config){
            if(!await this.patternGroupService.
                validateConfigPath({portConfigPath: validSetup.port_config.replace(/\\/g, '\\\\')} as PinPortConfigDTO)){
                    throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailReason.INVALID_PORT_CONFIG_PATH}`);
                }
        }
        if(validSetup.rename_signals){
            if(!await this.patternGroupService.
                validateConfigPath({pinConfigPath: validSetup.rename_signals.replace(/\\/g, '\\\\')} as PinPortConfigDTO)){
                    throw new BusinessError(BusinessErrorEnum.INVALID_PATH, `${FailReason.INVALID_RENAME_SIGNALS_PATH}`);
                }

        }

        const transaction = await Group.sequelize.transaction();
        try {
            // 将解析到的setup文件相关配置信息更新至对应的group表中
            await groupExist.update({
                setupConfig: validSetup
            },{transaction});
            await transaction.commit()
            return true
        } catch (error) {
            this.logger.error(error)
            await transaction.rollback()
            throw {
                message: 'Fail to upload core setup template file'
            }
        }
    }
  
    /**
     * 过滤上传的setup文件中参数，并校验参数值的合法性
     * @param {UICoreSetupDTO} setup 从上传的文件中解析得到的参数名及参数值
     * @returns
     */
    async validataSetup(@Valid() setup: UICoreSetupDTO): Promise<any>{
        // V1.0-0 版本仅仅支持以下参数的类型校验和编辑
        // 'port_config', 'rename_signals' 后续版本这两个参数也修改为在UI上直接编辑
        // const validPrams = ['exclude_signals', 'optimize_drive_edges', 'optimize_receive_edges',
        //     'pattern_comments', 'repeat_break', 'equation_based_timing', 'add_scale_spec',
        //     'label_suffix', 'port_config', 'rename_signals'
        // ];
        // const validSetup = {}
        // for (const paramName in setup){
        //     if (paramName in validPrams) {
        //         validSetup[paramName] = setup[paramName]
        //     } else{
        //         this.logger.warn(paramName + ' is not supported')
        //     }
        // }
        // return validSetup
        return setup
    }

    /**
    * 下载setup模版文件，模版文件存放路径为：cpp-core/template/core_setup_template.xlsx
    * @param 
    * @returns 
    */
    async download(): Promise<boolean> {
      try {
        const setupPath = path.join(path.resolve(__dirname, '../../../cpp-core/template'), 'core_setup_template.xlsx');
        this.ctx.set('Content-Disposition', 'attachment; filename=core_setup_template.xlsx');
        this.ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        this.ctx.body = fs.readFileSync(setupPath)
        // this.ctx.body = fs.createReadStream(setupPath)
        return
      } catch (error) {
        this.logger.error(error)
        throw {
            message: 'Fail to download core setup template file'
        }
      }
    }
}