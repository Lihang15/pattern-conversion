import { Rule, RuleType } from "@midwayjs/validate";

/**
 * patternGroup相关验证器
 * @author lihang.wang
 * @date 2024.12.26
 */
export class QueryPatternGroupDTO{
    @Rule(RuleType.string().allow(null,''))
    groupName: string

    @Rule(RuleType.string().allow(null,''))
    fileName: string

    @Rule(RuleType.number().integer())
    projectId: number

    @Rule(RuleType.number().integer().min(1).max(500).allow(null,''))
    current: number

    @Rule(RuleType.number().integer().min(1).allow(null,''))
    pageSize: number

    @Rule(RuleType.string().allow(null,''))
    sorter: string

}

export class UpdatePatternGroupDTO{
    // @Rule(RuleType.string().required())
    // projectName?: string

    @Rule(RuleType.allow(null))
    setupConfig: JSON

    @Rule(RuleType.boolean().allow(null))
    enableTimingMerge: boolean
}

export class PinPortConfigDTO{
    @Rule(RuleType.string().allow(null,''))
    pinConfigPath: string

    @Rule(RuleType.string().allow(null,''))
    portConfigPath: string

    @Rule(RuleType.string().allow(null,''))
    excludeSignalsPath: string
}

export class SwitchGroupDTO{
    @Rule(RuleType.number().integer())
    projectId: number

    @Rule(RuleType.number().integer())
    patternId: number

    @Rule(RuleType.number().integer())
    groupId: number
}


export class DownloadSetupDTO{
    @Rule(RuleType.number().integer())
    projectId: number

    @Rule(RuleType.number().integer())
    groupId: number
}

export class UploadSetupDTO{
    @Rule(RuleType.number().integer().required())
    projectId: number

    @Rule(RuleType.number().integer().required())
    groupId: number
}
