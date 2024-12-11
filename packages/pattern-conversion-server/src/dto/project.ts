import { Rule, RuleType } from "@midwayjs/validate";


export class QueryProjectDTO{
    @Rule(RuleType.string().allow(null,''))
    projectName: string

    @Rule(RuleType.number().integer().min(1).max(500).allow(null,''))
    pageNo: number

    @Rule(RuleType.number().integer().min(1).allow(null,''))
    pageSize: number
}


export class CreateProjectDTO{
    @Rule(RuleType.string().required())
    projectName: string

    @Rule(RuleType.string().required())
    path: string
}

export class RefreshProjectDTO{
    @Rule(RuleType.string().required())
    projectName: string

    @Rule(RuleType.string().required())
    path: string
}