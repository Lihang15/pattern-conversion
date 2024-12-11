import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull, ForeignKey, HasMany } from 'sequelize-typescript';
import { Account } from './account';
import { Resource } from './resource';


@Table({
    tableName:'project',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'项目表'
})
export class Project extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('项目id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('项目名')
  @Column(DataType.STRING())
  projectName: string;

  @AllowNull(false)
  @Comment('项目路径')
  @Column(DataType.STRING())
  path: string;

  @Comment('是否当前正在使用的项目')
  @Column(DataType.INTEGER())
  isCurrent: number;

  @ForeignKey(() => Account)
  @Comment('account_id')
  @Column(DataType.INTEGER())
  accountId: string

  
  @HasMany(() => Resource)
  resources: Resource[];

}