import { request } from "@umijs/max";




/** 获取项目group详情  */
export async function getPatternGroupDetail( params:any,options?: Record<string, any>) {
  return request<any>(`/api/project/pattern/group/${params.id}`, {
    method: 'GET',
    // headers: {
    //   'Content-Type': 'application/json',
    // },
    ...(options || {}),
  });
}
/** 切换项目  */
export async function updatePatternGroup( params:any, body: any, options?: Record<string, any>) {
  return request<any>(`/api/project/pattern/group/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传core-setup文件  */
export async function uploadSetupFile( params:any, body: any, options?: Record<string, any>) {
  return request<any>(`/api/project/pattern/setup/upload?${params.projectId}&${params.groupId}`, {
    method: 'Post',
    headers: {
      'Content-Type': 'multipart/form-data',  
    },
    data: body,
    ...(options || {}),
  });
}

/** 下载core-setup文件模板  */
export async function downloadSetupFile( params:any, options?: Record<string, any>) {
  return request<any>(`/api/project/pattern/setup/download`, {
    method: 'Get',
    // headers: {
    //   'Content-Type': 'multipart/form-data',  
    // },
    responseType: 'blob',
    ...(options || {}),
  });
}