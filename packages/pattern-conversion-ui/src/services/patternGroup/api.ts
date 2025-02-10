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

