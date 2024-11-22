import { request } from "@umijs/max";


/** 获取项目list  */
export async function projectList( params:any,options?: Record<string, any>) {
    return request<any>(`/api/project/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params,
      ...(options || {}),
    });
  }