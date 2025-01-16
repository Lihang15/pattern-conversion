// src/job/sync.job.ts
import { Job, IJob } from '@midwayjs/cron';
import { FORMAT } from '@midwayjs/core';


/**
 * 定时任务,每30分钟refresh项目一次
 * @author lihang.wang
 * @date 2024.12.26
 */

@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
  runOnInit:true
})
export class RefreshProjectJob implements IJob {
  async onTick() {
    console.log('定期任务 定期refresh project');
    
  }
}