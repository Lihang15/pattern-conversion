import { Rule, RuleType, PickDto } from "@midwayjs/validate";


export enum PatternCommentType {
    ON = 'on',
    OFF = 'off',
  }

// signal_timing_mapping 的校验函数
function isValidSignalTimingMapping(signal_timing_mapping: string): boolean {
  // {signalname: {U, D, U: -,D, U} {UN, D, U: -,D, U};{ signalname: {U, D, U: -,D, U}{UN, D, U: -,D, U} } 
  //return /^[a-zA-Z0-9]+$/.test(str);
  return true
}

// cpp-core 支持的参数全集
export class CoreSetupDTO{
    @Rule(RuleType.string().required().valid('WGL', 'STIL'))
    input_file_type: string
    
    // 非中文字符
    @Rule(RuleType.string().required().pattern(/^[\x00-\xff\.\\\,\:]+$/))
    input_file_path: string

    // 不支持中文、绝对路径和相对路径
    @Rule(RuleType.string().required().pattern(/^[\w./-\\]+$/))
    workdir: string

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().required().pattern(/^(?!_)\w+$/))
    project_name: string

    // 可以为空，不支持中文
    @Rule(RuleType.string().allow('').pattern(/^[\x00-\xff\.\\\:]*$/))
    port_config?: string

    // 可以为空，不支持中文
    @Rule(RuleType.string().allow('').pattern(/^[\x00-\xff\.\\\:]*$/))
    rename_signals?: string

    // 可以为空，不支持中文
    @Rule(RuleType.string().allow('').pattern(/^[\x00-\xff\.\\\:]*$/))
    exclude_signals?: string

    // 可以为空，不支持中文
    @Rule(RuleType.string().allow('', 'None').pattern(/^[\x00-\xff\.\\\:]*$/))
    combinations_file?: string

    @Rule(RuleType.number().integer().default(1).valid(0, 1))
    optimize_drive_edges?: number

    @Rule(RuleType.number().integer().default(1).valid(0, 1))
    optimize_receive_edges?: number

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().pattern(/^(?!_)\w+$/))
    waveformtable_name?: string

    @Rule(RuleType.string().pattern(/^(?!_)\w+$/))
    equationset_name?: string 

    @Rule(RuleType.string().pattern(/^(?!_)\w+$/))
    specificationset_name?: string

    @Rule(RuleType.string().valid(...Object.values(PatternCommentType)))
    pattern_comments?: string

    // signal_timing_mapping={}
    // {signalname: {U, D, U: -,D, U} {UN, D, U: -,D, U};
    @Rule(RuleType.string().custom(isValidSignalTimingMapping))
    signal_timing_mapping?: string

    // 正整数
    @Rule(RuleType.number().integer().default(0).min(0))
    repeat_break?: number

    // 0/1
    @Rule(RuleType.number().default(1).valid(0, 1))
    equation_based_timing?: number

    // 0/ 1
    @Rule(RuleType.number().default(0).valid(0, 1))
    add_scale_spec?: number

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().allow('').pattern(/^(?!_)\w+$/))
    label_suffix?: string

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().default('').pattern(/^(?!_)\w+$/))
    level_specification_set?: string

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().default('').pattern(/^(?!_)\w+$/))
    level_equation_set?: string

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().default('').pattern(/^(?!_)\w+$/))
    level_set?: string

    // 0/1/X/Z
    @Rule(RuleType.string().valid('0', '1', 'X', 'Z').default('0'))
    wgl_scan_in_padding?: string

    // 0/1/X/Z
    @Rule(RuleType.string().valid('0', '1', 'X', 'Z').default('X'))
    wgl_scan_output_padding?: string

    // 0/1
    @Rule(RuleType.number().default(1).valid(0, 1))
    wgl_purge_unused_timeplates?: number

    // 0/1
    @Rule(RuleType.number().default(0).valid(0, 1))
    wgl_purge_unused_waveforms?: number

    // 0/1
    @Rule(RuleType.number().default(1).valid(0, 1))
    wgl_add_drive_off?: number

    // 数字、英文字母或_组成的字符串，且_不可开头
    @Rule(RuleType.string().default('').pattern(/^(?!_)\w+$/))
    stil_pattern_exec?: string

    // 0/1/X/Z
    @Rule(RuleType.string().valid('0', '1', 'X', 'Z').default('0'))
    stil_pad_scanin?: string

    // 0/1/X/Z
    @Rule(RuleType.string().valid('0', '1', 'X', 'Z').default('X'))
    stil_pad_scanout?: string
}

// UI 配置的core setup参数
// input_file_type / input_file_path / workdir / project_name / combinations_file
// rename_signals / port_config V1.0.0 在UI上配置，之后的版本也不在UI上配置, 
export class UICoreSetupDTO extends PickDto(CoreSetupDTO, 
  ['exclude_signals', 'optimize_drive_edges', 'optimize_receive_edges', 'pattern_comments', 
    'repeat_break', 'equation_based_timing', 'add_scale_spec', 'label_suffix', 
    'port_config', 'rename_signals']) {
};

// server程序内设置的参数，不在UI上配置的
export class ServerCoreSetupDTO extends PickDto(CoreSetupDTO,
  ['input_file_type', 'input_file_path', 'workdir', 'project_name', 'combinations_file']){
};

export class ConversionProcessDTO{
  patIndex: number;
  patCount: number;
  percent: number;
}