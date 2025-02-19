import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

import { Op, Order, OrderItem, WhereOptions } from "sequelize";
import * as dayjs from 'dayjs';
import { Pattern } from "../../entity/postgre/pattern";
import { Project } from "../../entity/postgre/project";
import { BusinessError, BusinessErrorEnum } from "../../error/BusinessError";
import { Group } from "../../entity/postgre/group";
import { PinPortConfigDTO, QueryPatternGroupDTO, SwitchGroupDTO, UpdatePatternGroupDTO } from "../../dto/patternGroup";
import { PathService } from "../common/PathService";
import { ILogger } from "@midwayjs/logger";
import { UtilService } from "../common/UtilService";



/**
 * pattern和group服务层
 * @author lihang.wang
 * @date 2024.1.10
 */
@Provide()
export class PatternGroupService {

    @Inject()
    ctx: Context
    @Inject()
    pathService: PathService
    @Inject()
    logger: ILogger
    @Inject()
    utilService: UtilService

    /**
     * 获取pattern group详情
     * 
     * @param {QueryPatternGroupDTO} params 参数
     * @return
     * @memberof PatternGroupService
     */
    async getProjectPatternList(params: QueryPatternGroupDTO) {

        const { current, pageSize, sorter, ...query } = params

        const projectExist = await Project.findOne({
            attributes: ['id', 'projectName'],
            where: {
                id: query.projectId,
            },
            raw: true
        })

        if (!projectExist) {
            throw new BusinessError(BusinessErrorEnum.NOT_FOUND, '项目不存在')
        }

        const offset: number = current || 1
        const limit: number = pageSize || 10

        // 排序处理开始
        let order: Order = [['createdAt', 'desc']]
        if (sorter) {
            order = sorter.split('|').map(
                sort =>
                    sort.split(',').map(item => {
                        if (item === 'ascend' || item === 'descend') {
                            return item.replace('end', '')
                        }
                        return item 
                    }) as OrderItem
            )
        }
        // 排序处理结束

        // 拼接where条件
        const where: WhereOptions<Pattern> = {}

        where.projectId = query.projectId
        if (query.fileName) {
            where.fileName = { [Op.like]: `%${query.fileName}%` }
        }

        if (Array.isArray(query['updatedAtRange']) && query['updatedAtRange'].length === 2) {
            where.updatedAt = {
                [Op.between]: [
                    dayjs(query['updatedAtRange'][0]).startOf('day').toDate(),
                    dayjs(query['updatedAtRange'][1]).startOf('day').toDate()
                ]
            }
        }
        // 条件添加结束
        const { rows, count } = await Pattern.findAndCountAll({
            include: [
                {
                    model: Group
                }
            ],
            where,
            offset: (offset - 1) * limit,
            limit,
            order,
            raw: true,//返回一个普通的javascript对象，而不是sequelize对象
            nest: true, //有关联表时候，数据不平铺，结构化返回
        });
        const result = rows.map((row) => {
            row['key'] = row.id,
                row['groupName'] = row.group.groupName
            return row
        })


        return { pattern: result, total: count, current: offset, pageSize: limit }
    }

        /**
     * 修改项目属性 业务处理
     * 
     * @param {number} id 参数
     * @return
     * @memberof PatternGroupService
     */
        async getProjectPatternGroup(id: number): Promise<any>{

            const groupExist = await Group.findOne({
                where:{
                    id,
                },
            })
            // 项目不存在
            if(!groupExist){
                throw new BusinessError(BusinessErrorEnum.EXIST,'group不存在')
            }
            
            return groupExist
        }
    
        /**
         * 修改pattern group属性 业务处理
         * 
         * @param {UpdatePatternGroupDTO} params 参数
         * @return
         * @memberof PatternGroupService
         */
        async updatePatternGroup(id: number, params: UpdatePatternGroupDTO): Promise<boolean>{
            console.log('xxxxxxxxxxxxxxxxxxx',params);
            
           
            await Group.update({
                ...params
            },{
                where:{
                    id 
                }
            })
            return true
        }
 

         /**
     * 验证pin/port config路径参数
     * 
     * @param {PinPortConfigDTO} params 参数
     * @return
     * @memberof PatternGroupService
     */
    async validateConfigPath(params: PinPortConfigDTO): Promise<boolean> {
        const { pinConfigPath, portConfigPath, excludeSignalsPath } = params
        try {
            if (pinConfigPath.length > 0 && !await this.pathService.fileExists(pinConfigPath)) {
                return false;
            }
            if (portConfigPath.length > 0 && !await this.pathService.fileExists(portConfigPath)) {
                return false;
            }
            if (excludeSignalsPath.length > 0 && !await this.pathService.fileExists(excludeSignalsPath)) {
                return false;
            }
            return true;
        } catch (error) {
            this.logger.error(error);
        } 
    }

    /**
     * 切换pattern group
     * 
     * @param {SwitchGroupDTO} params 参数
     * @return
     * @memberof PatternGroupService
     */
    async swtichGroup(params: SwitchGroupDTO): Promise<boolean> {

        const { projectId,patternId, groupId } = params
            const group = await Group.findOne({
                where: {
                    id: groupId,
                },
                raw: true
            });
            if (!group) {
                throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'没有找到对应的pattern group')
            }
            const pattern = await Pattern.findOne({
                where: {
                    id: patternId,
                },
                // raw: true
            })
            if(!pattern){
                throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'没有找到对应的pattern')
            }
            const currentProjectGroup = await Project.findOne({
                where:{
                    id: projectId
                },
                include:[{model:Group,
                    where: {
                        id: groupId
                    },
                    order: [['id','desc']]}],
            })
            if(!currentProjectGroup){
                throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'项目下没有该group')
            }

            const currentProjectPattern = await Project.findOne({
                where:{
                    id: projectId
                },
                include:[{model:Pattern,
                    where: {
                        id: patternId
                    },
                    order: [['id','desc']]}],
            })
            if(!currentProjectPattern){
                throw new BusinessError(BusinessErrorEnum.NOT_FOUND,'项目下没有该pattern')
            }

            await pattern.update({
                groupId
            })
            return true
       
    }




}