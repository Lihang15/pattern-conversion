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

/** 获取项目dashboard  */
export async function projectProjectDashboard( params:any,options?: Record<string, any>) {
  return request<any>(`/api/projects/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM0MDU0NDUyLCJleHAiOjE3MzQwOTA0NTJ9.cj2ExyxZlyWhJqIc34gr_gY-Ykfe8DrwNQ1ABBtw-x4'
    },
    params,
    ...(options || {}),
  });
}

/** 切换项目  */
export async function updateProject( params:any, body: any, options?: Record<string, any>) {
  return request<any>(`/api/projects/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM0MDU0NDUyLCJleHAiOjE3MzQwOTA0NTJ9.cj2ExyxZlyWhJqIc34gr_gY-Ykfe8DrwNQ1ABBtw-x4'
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建项目  */
export async function createProject( params:any, body: any, options?: Record<string, any>) {
  return request<any>(`/api/projects/${params.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM0MDU0NDUyLCJleHAiOjE3MzQwOTA0NTJ9.cj2ExyxZlyWhJqIc34gr_gY-Ykfe8DrwNQ1ABBtw-x4'
    },
    data: body,
    ...(options || {}),
  });
}



/** 开始转换  */
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