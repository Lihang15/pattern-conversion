import { RequestConfig } from "@umijs/max";
import { notification } from "antd";
import { getToken } from "./utils/account";

export const errorConfig: RequestConfig = {
    // 请求拦截器 请求之前为每个接口 加token
    requestInterceptors: [
        (config: any) => {
        // 拦截请求配置，进行个性化处理。
        // const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODI2NTgwNTYsImV4cCI6MTY4MjcxODA1Nn0.PeA1QX-sADDDY5FmS2BT0AD-1YBrQogic2wQq5EdR1k1111'
        const token = getToken() 
        if (token) {  
          config.headers.Authorization = `Bearer ${token}`
        }  
        return { ...config};
        }
      ],
      errorConfig: {
        // 错误接收及处理
        errorHandler: (error: any, opts: any) => {
          if (opts?.skipErrorHandler) throw error;
          
          if (error.response) {
            // console.log('resp',error.response);
            // 已得到服务器响应，是否做状态处理 //status不是200都会被拦截到
            if(error.response.status===500){
                notification.error({
                  message: error.response.data.message
                })
            }
          } else{
            // console.log('error3',error.request);
             //连接不到服务器
               notification.error({
                description: '连接不到服务器，请稍后再试',
                message: 'failed',
              });
          }
        },
      },
      //调用接口响应如果是token过期，回到登录页
      responseInterceptors: [
        (response: any)=>{
          return response

        }
      ]
}