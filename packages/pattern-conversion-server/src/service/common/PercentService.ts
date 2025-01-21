import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class PercentService {
  // 待转pattern总数
  patCount: number = 0;
  // 正在转的pattern的index
  patIndex: number = 0;
  // 同步到UI的进度
  process: number = 0;
  // conversion 成功的pattern数量
  patSuccessCnt: number = 0;
  // conversion 失败的pattern数量
  patFailCnt: number = 0;

  public addIndex(): number {
    this.patIndex = this.patIndex + 1;
    return this.patIndex
  }

  public addSuccessCnt(): number {
    this.patSuccessCnt = this.patSuccessCnt + 1
    return this.patSuccessCnt
  }

  public addFailCnt(): number {
    this.patFailCnt = this.patFailCnt + 1
    return this.patFailCnt
  }
  
  public updataPercent(): number{
    if (this.patCount !== 0) {
      let process = this.patIndex / this.patCount
      if (process > 0.9) {
        process = 0.9
      }
      this.process = parseFloat(process.toFixed(1))
    }
    return this.process
  }

}