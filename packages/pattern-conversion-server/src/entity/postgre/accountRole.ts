import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, ForeignKey } from 'sequelize-typescript';
import { Role } from './role';
import { Account } from './account';


@Table({
    tableName:'account_role',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'账户和角色对应表'
})
export class AccountRole extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('角色id')
  @ForeignKey(()=>Role)
  @Column(DataType.INTEGER())
  roleId: number;

  @Comment('账户id')
  @ForeignKey(()=>Account)
  @Column(DataType.INTEGER())
  accountId: number;

}