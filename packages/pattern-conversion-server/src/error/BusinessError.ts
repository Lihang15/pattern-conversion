import { MidwayError } from '@midwayjs/core';

/**
 * 自定义业务异常
 * @author lihang.wang
 * @date 2024.12.26
 */
export const BusinessErrorEnum = {
    NOT_FOUND: 10000,
    PASSWORD_ERROR:10001,
    EXIST: 20001,
    UNKNOWN: 30000,
    MAKE_DIR_FAILED: 40000,
    DUPLICAT_FILE:50000,
    INVALID_PATH:60000,
}

export class BusinessError extends MidwayError {
  constructor(
    code: string | number,
    message: string,
  ) {
    super(message , <string>code)
  }
}

export const FailType = {
  CREATE_PROJECT_FAIL: '创建项目失败: ',
  REFRESH_PROJECT_FAIL: '刷新项目失败: ',
  CREATE_GROUP_FAIL: '创建group失败: ',
}

export const FailReason = {
  NO_ABSOLUTE_INPUT_PATH: '输入目录不是绝对路径的',
  NO_ABSOLUTE_OUTPUT_PATH: '输出目录不是绝对路径',
  NO_EXIST_INPUT_PATH: '输入路径不存在',
  NO_EXIST_OUTPUT_ROOT_DIR: '输出目录的盘符不存在',
  INVALID_OUTPUT_PATH: '输出目录不能同输入目录相同或是输入目录的子目录',
  EXIST_PROJECT_NAME: '项目名已存在',
  NO_VALID_PATTERN: '在输入路径下未查找到.stil和.wgl类型的pattern文件',
  MAKE_PATTERN_GROUP_FAIL: '获取pattern文件默认pattern group信息失败',
  NO_EXIST_PROJECT: '项目不存在',
  EXIST_GROUP_NAME: 'pattern group名已存在',
}
