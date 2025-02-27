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
    CHILD_PROCESS_ERROR:70000,
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
  LOGIN_FAILED: 'Login failed: ',
  INSERT_USER_FAIL: 'Administrator failed to add user: ',
  CREATE_PROJECT_FAIL: 'Failed to create project: ',
  REFRESH_PROJECT_FAIL: 'Failed to refresh project: ',
  CREATE_GROUP_FAIL: 'Failed to crate pattern group: ',
  SWITCH_GROUP_FAIL: 'Failed to switch pattern group: ',
}

export const FailReason = {
  INCORRECT_USER_NAME_OR_PASSWORD: 'username or password is incorrect.',
  EXIST_USER_EMAIL: "the user's email already exists.",
  NO_EXIST_USER_ROLE_NAME: "the user's role name does not exist.",
  NO_ABSOLUTE_INPUT_PATH: 'the input directory is not an absolute path.',
  NO_ABSOLUTE_OUTPUT_PATH: 'the output directory is not an absolute path.',
  NO_EXIST_INPUT_PATH: 'the input path does not exist.',
  NO_EXIST_OUTPUT_ROOT_DIR: 'the drive letter of the output directory does not exist.',
  INVALID_OUTPUT_PATH: 'the output directory cannot be the same as or a subdirectory of the input directory.',
  EXIST_PROJECT_NAME: 'the project name already exists.',
  NO_VALID_PATTERN: 'no .stil and .wgl type pattern files found in the input path.',
  MAKE_PATTERN_GROUP_FAIL: 'failed to get the default pattern group information for pattern files.',
  NO_EXIST_PROJECT: 'the project does not exist.',
  EXIST_GROUP_NAME: 'the pattern group name already exists.',
  NO_EXIST_PATTERN_GROUP: 'the pattern group does not exist.',
  NO_EXIST_PATTERN: 'the pattern does not exist.',
  NO_EXIST_PATTERN_GROUP_IN_PROJECT: 'there is no such pattern group in this project.',
  NO_EXIST_PATTERN_IN_PROJECT: 'there is no such pattern in this project.',
  INVALID_EXCLUDE_SIGNALS_PATH: 'The value of the parameter "exclude_signals" is not a valid path.',
  INVALID_RENAME_SIGNALS_PATH: 'The value of the parameter "rename_signals" is not a valid path.',
  INVALID_PORT_CONFIG_PATH: 'The value of the parameter "port_config" is not a valid path.',
}
