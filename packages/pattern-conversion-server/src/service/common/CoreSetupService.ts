import { Provide } from "@midwayjs/core";
import * as ini from "ini";
import * as fs from "fs";
import { ServerCoreSetupDTO, UICoreSeupDTO } from "../../dto/coreSetup";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { Valid } from "@midwayjs/validate";

@Provide()
export class CoreSetupService {
    async genSetup(setupPath, @Valid() coreSetup: ServerCoreSetupDTO, coreSetupParams: UICoreSeupDTO): Promise<boolean> {
        const { input_file_type, input_file_path, workdir,  project_name } = coreSetup
        const setupData = {
            Common:{},
            WGL:{},
            STIL:{}};
        // 设置UI上配置的参数
        for (let paramName in coreSetupParams) {
            let section = await this.getParamSection(paramName)
            if (section === 'Common') {
                setupData.Common[paramName] = coreSetupParams[paramName]
            }
            else if (section === 'WGL') {
                setupData.WGL[paramName] = coreSetupParams[paramName]
            }
            else if(section === 'STIL'){
                setupData.STIL[paramName] = coreSetupParams[paramName]
            }
            else {
                throw new BusinessError(BusinessErrorEnum.UNKNOWN, "未知的参数")
            }
        }
        // 设置不在UI上设置的参数
        setupData.Common['input_file_type'] = input_file_type
        setupData.Common['input_file_path'] = input_file_path
        setupData.Common['workdir'] = workdir
        setupData.Common['project_name'] = project_name
        if (coreSetup.combinations_file) {
            setupData.Common['combinations_file'] = coreSetup.combinations_file
        }
          
        const iniString = ini.encode(setupData);
        fs.writeFileSync(setupPath, iniString);
        return true
    }

    async getParamSection(paramName: string): Promise<string> {
        const commonParams = [
            'exclude_signals',
            'optimize_drive_edges',
            'optimize_receive_edges',
            'waveformtable_name',
            'equationset_name',
            'specificationset_name',
            'pattern_comments',
            'signal_timing_mapping',
            'repeat_break',
            'equation_based_timing',
            'add_scale_spec',
            'label_suffix',
            'level_specification_set',
            'level_equation_set',
            'level_set'
        ];
        const wglParams = [
            'wgl_scan_in_padding', 
            'wgl_scan_output_padding', 
            'wgl_purge_unused_timeplates', 
            'wgl_purge_unused_waveforms',
            'wgl_add_drive_off'
        ];
        const stilParams = [
            'stil_pattern_exec', 
            'stil_pad_scanin', 
            'stil_pad_scanout'
        ];
    
        if (commonParams.includes(paramName)) {
            return 'Common';
        }
        else if (wglParams.includes(paramName)) {
            return "WGL"
        }
        else if (stilParams.includes(paramName)) {
            return "STIL"
        }
        else {
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'参数名错误');
        }  
    }
}