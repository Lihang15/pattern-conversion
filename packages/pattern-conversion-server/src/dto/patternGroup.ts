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


