import { request } from "@umijs/max";


/** 获取项目list  */
export async function projectList( params:any,options?: Record<string, any>) {
    return request<any>(`/api/project`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params,
      ...(options || {}),
    });
}

/** 获取项目dashboard  */
export async function projectDashboard( params:any,options?: Record<string, any>) {
  
  return request<any>(`/api/project/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

/** 获取项目详情  */
export async function getProjectDetail( params:any,options?: Record<string, any>) {
  return request<any>(`/api/project/detail`, {
    method: 'GET',
    // headers: {
    //   'Content-Type': 'application/json',
    // },
    params,
    ...(options || {}),
  });
}
/** 切换项目  */
export async function updateProject( params:any, body: any, options?: Record<string, any>) {
  return request<any>(`/api/project/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建项目  */
export async function createProject( body: any, options?: Record<string, any>) {
  return request<any>(`/api/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建项目  */
export async function refreshProject( body: any, options?: Record<string, any>) {
  return request<any>(`/api/project/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建新的group  */
export async function createProjectGroup( body: any, options?: Record<string, any>) {
  return request<any>(`/api/project/pattern/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}




/** 开始转换  */
export async function startPatternConversion( params:any,options?: Record<string, any>) {
  return request<any>(`/api/project/start_pattern_conversion`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}


/** 获取项目pattern list  */
export async function patternList( params:any,options?: Record<string, any>) {
  // params.projectId = 2
  return request<any>(`/api/project/pattern`, {
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