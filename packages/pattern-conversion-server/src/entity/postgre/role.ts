import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, BelongsToMany } from 'sequelize-typescript';
import { Account } from './account';
import { AccountRole } from './accountRole';


@Table({
    tableName:'role',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'角色'
})
export class Role extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('角色名字')
  @Column(DataType.STRING())
  roleName: string;

  @BelongsToMany(()=>Account,()=>AccountRole)
  account: Account[]
}