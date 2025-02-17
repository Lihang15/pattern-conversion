import { Rule, RuleType } from "@midwayjs/validate"
/**
 * 用户account相关验证器
 * @author lihang.wang
 * @date 2024.12.26
 */
export class LoginDTO{
    @Rule(RuleType.string().required())
    email: string

    @Rule(RuleType.string().required())
    password: string
}


export class InsertUsrsDTO {
    @Rule(RuleType.string().required())
    username: string

    @Rule(RuleType.string().required())
    email: string

    @Rule(RuleType.string().required())
    password: string

    @Rule(RuleType.string().allow(null,''))
    avatar: string

    @Rule(RuleType.array().items(RuleType.string()).min(1).required())
    roles: string[]
}