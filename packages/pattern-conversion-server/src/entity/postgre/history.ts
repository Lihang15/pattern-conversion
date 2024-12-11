import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, ForeignKey } from 'sequelize-typescript';
import { Resource } from './resource';



@Table({
    tableName:'history',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'操作历史'
})
export class History extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('内容')
  @Column(DataType.STRING())
  content: string;

  @ForeignKey(() => Resource)
  @Comment('resource_id')
  @Column(DataType.INTEGER())
  resourceId: number
}