import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/DefaultFilter';
import { NotFoundFilter } from './filter/NotfoundFilter';
import { ReportMiddleware } from './middleware/report.middleware';
import { BusinessErrorFilter } from './filter/BusinessFilter';
import { ValidationErrorFilter } from './filter/ValidationFilter';
import * as crossDomain from '@midwayjs/cross-domain';
import * as sequelize from '@midwayjs/sequelize';
import * as jwt from '@midwayjs/jwt';
import { JwtMiddleware } from './middleware/auth.middleware';
import * as cron from '@midwayjs/cron';
import * as busboy from '@midwayjs/busboy';

@Configuration({
  imports: [
    koa,
    validate,
    crossDomain,
    sequelize,
    jwt,
    cron,
    busboy,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware,JwtMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter, BusinessErrorFilter, ValidationErrorFilter]);
  }
}
