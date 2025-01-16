import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey,Comment, AllowNull, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';
import { Account } from './account';
import { Pattern } from './pattern';

/**
 * @author lihang.wang
 * @date 2024.12.26
 */
export type PinConfig = {
  id: number,
  atePinName: string,
  sourcePatternPinName: string
}

export type PortList = {
    id: number,
    portName: string,
    pins: string[],
    xMode: number
}
export type PortConfig = {
   id: number,
   portName: string,
   portList: PortList[]
}

// export type PortConfigColType = {
//   content: PortConfig[]
// }
// export type pinConfigColType = {
//   content: PortConfig[]
// }

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
  inputPath: string;
  
  @AllowNull(false)
  @Comment('项目路径')
  @Column(DataType.STRING())
  outputPath: string;

  @Comment('是否当前正在使用的项目')
  @Column(DataType.BOOLEAN())
  isCurrent: boolean;

  @Comment('是否自动转换pattern')
  @Column(DataType.BOOLEAN())
  automaticPatternConversion: boolean;

  @Comment('是否自动刷新资源')
  @Column(DataType.BOOLEAN())
  automaticRefreshResources: boolean;

  @Comment('pin config')
  @Column(DataType.JSON)
  pinConfig: PinConfig;

  @Comment('pin 文件上传路径')
  @Column(DataType.STRING())
  pinConfigPath: string;

  @Comment('port config')
  @Column(DataType.JSON)
  portConfig: PortConfig;

  @Comment('port 文件上传路径')
  @Column(DataType.STRING())
  portConfigPath: string;

  @ForeignKey(() => Account)
  @Comment('account_id')
  @Column(DataType.INTEGER())
  accountId: number

  
  @HasMany(() => Pattern)
  resources: Pattern[];

  @BelongsTo(() => Account)
  account: Account

}