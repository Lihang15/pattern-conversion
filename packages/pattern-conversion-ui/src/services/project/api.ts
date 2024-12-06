import { request } from "@umijs/max";


/** 获取项目list  */
export async function projectList( params:any,options?: Record<string, any>) {
    return request<any>(`/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params,
      ...(options || {}),
    });
}

/** 获取项目list  */
export async function startPatternConversion( params:any,options?: Record<string, any>) {
  return request<any>(`/api/projects/start_pattern_conversion`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

// export async function startPatternConversion(
//   body?: API.UserInfoVO,
//   options?: { [key: string]: any },
// ) {
//   return request<API.Result_UserInfo_>('/api/projects/start_pattern_conversion', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }