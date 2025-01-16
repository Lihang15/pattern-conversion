import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';
import { Project } from './project';
import { History } from './history';
import { Group } from './group';

/**
 * @author lihang.wang
 * @date 2024.12.26
 */
@Table({
    tableName:'pattern',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'项目下的资源'
})
export class Pattern extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('资源文件路径')
  @Column(DataType.STRING())
  path: string;

  @Comment('资源文件名')
  @Column(DataType.STRING())
  fileName: string;

  @Comment('md5')
  @Column(DataType.STRING())
  md5: string;

  @AllowNull(false)
  @Comment('资源状态')
  @Column(DataType.STRING())
  status: 'new' | 'changed';

  @AllowNull(false)
  @Comment('资源状态')
  @Column(DataType.STRING())
  conversionStatus:  'success' | 'done' | 'failed' | 'ongoing';

  @Comment('error log')
  @Column(DataType.STRING())
  errorLog: string

  @Comment('format')
  @Column(DataType.STRING())
  format: string

  @Comment('转换次数')
  @Column(DataType.INTEGER())
  conversionFrequency: number

  @ForeignKey(() => Project)
  @Comment('account_id')
  @Column(DataType.INTEGER())
  projectId: number

  @ForeignKey(() => Group)
  @Comment('group_id')
  @Column(DataType.INTEGER())
  groupId: number
  
  @HasMany(() => History)
  historys: History[];

  @BelongsTo(() => Group)
  group: Group;

}