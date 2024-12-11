import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull, ForeignKey, HasMany } from 'sequelize-typescript';
import { Project } from './project';
import { History } from './history';

@Table({
    tableName:'resource',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'项目下的资源'
})
export class Resource extends Model {
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
  status: 'new' | 'changed' | 'done' | 'failed';

  @Comment('error log')
  @Column(DataType.STRING())
  errorLog: string

  @Comment('转换次数')
  @Column(DataType.INTEGER())
  conversionFrequency: number

  @ForeignKey(() => Project)
  @Comment('account_id')
  @Column(DataType.INTEGER())
  projectId: number
  
  @HasMany(() => History)
  historys: History[];
}