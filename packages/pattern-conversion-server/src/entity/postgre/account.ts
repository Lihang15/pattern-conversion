import { Table, Model, Column, HasMany, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull, BelongsToMany } from 'sequelize-typescript';
import { Project } from './project';
import { Role } from './role';
import { AccountRole } from './accountRole';


@Table({
    tableName:'account',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    comment:'用户表'
})
export class Account extends Model {
  @AutoIncrement
  @PrimaryKey
  @Comment('用户id')
  @Column(DataType.INTEGER())
  id: number;

  @Comment('用户名')
  @Column(DataType.STRING())
  username: string;

  @AllowNull(false)
  @Comment('密码')
  @Column(DataType.STRING())
  password: string;

  @Comment('头像')
  @Column(DataType.STRING())
  avatar: string;


  @HasMany(() => Project)
  projects: Project[];

  @BelongsToMany(()=>Role,()=>AccountRole)
  roles: Role[]
}