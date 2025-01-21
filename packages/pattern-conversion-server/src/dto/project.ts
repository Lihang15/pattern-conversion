import { Rule, RuleType } from "@midwayjs/validate";

/**
 * 用户project相关验证器
 * @author lihang.wang
 * @date 2024.12.26
 */
export class QueryProjectDTO{
    @Rule(RuleType.string().allow(null,''))
    projectName: string

    @Rule(RuleType.number().integer().min(1).max(500).allow(null,''))
    current: number

    @Rule(RuleType.number().integer().min(1).allow(null,''))
    pageSize: number

    @Rule(RuleType.string().allow(null,''))
    sorter: string

    @Rule(RuleType.string().allow(null,''))
    username: string

}


export class CreateProjectDTO{
    @Rule(RuleType.string().required())
    projectName: string

    @Rule(RuleType.string().required())
    inputPath: string

    @Rule(RuleType.string().required())
    outputPath: string
}

export class UpdateProjectDTO{
    @Rule(RuleType.string().required())
    projectName?: string

    @Rule(RuleType.boolean())
    isCurrent: boolean
}

export class RefreshProjectDTO{
    @Rule(RuleType.string().required())
    projectName: string

    @Rule(RuleType.string().required())
    path: string
}

export class ConversionProjectDTO{
    @Rule(RuleType.string().required())
    ids: string
}