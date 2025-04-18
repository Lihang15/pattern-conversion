

import { request } from "@umijs/max";

/** 登录  */
export async function login( body: any, options?: Record<string, any>) {
    return request<any>(`/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    });
}

/** 获取用户信息  */
export async function me( params:any,options?: Record<string, any>) {
    return request<any>(`/api/account/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params,
      ...(options || {}),
    });
}


/** 获取用户列表  */
export async function getUserList( params:any,options?: Record<string, any>) {
  return request<any>(`/api/account/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}


/** 添加用户  */
export async function addUser( body: any, options?: Record<string, any>) {
  return request<any>(`/api/account/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}