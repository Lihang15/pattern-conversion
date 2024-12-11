import { Rule, RuleType } from "@midwayjs/validate"

export class LoginDTO{
    @Rule(RuleType.string().required())
    email: string

    @Rule(RuleType.string().required())
    password: string
}