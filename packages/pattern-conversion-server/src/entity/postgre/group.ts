import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull


 } from 'sequelize-typescript';

/**
 * @author lihang.wang
 * @date 2024.12.26
 */
export type SetupConfig = {
  parameter: string,
  value: string
}
@Table({
    tableName:'group',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'用户表'
})
export class Group extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('用户id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('组名')
  @Column(DataType.STRING())
  groupName: string;

  @AllowNull(false)
  @Comment('setup路径')
  @Column(DataType.STRING())
  setupPath: string;

  @Comment('setup config')
  @Column(DataType.JSON)
  setupConfig: SetupConfig[];

}