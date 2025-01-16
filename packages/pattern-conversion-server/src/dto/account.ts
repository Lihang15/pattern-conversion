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