// 运行时配置
import './global.css'; // 确保引入全局样式

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
import GlobalHeaderRight from './components/test';
import { Link, RequestConfig, useNavigate } from '@umijs/max';


import { notification, Tree } from 'antd';
import { FileTextOutlined, FolderOutlined } from '@ant-design/icons';
export async function getInitialState(): Promise<{ name: string }> {
  return { name: 'wanglihang' };
}
const routes = [
  {
    key: '/about', 
    path: '/about',
    name: 'About',
    icon: <FolderOutlined />,
  },
  {
    key: '/Admin', 
    path: '/admin',
    name: 'Admin',
    icon: <FolderOutlined />,
    children: [
      
      {
        key: '/Admin/UserManagement', 
        path: '/Admin/UserManagement',
        name: 'UserManagement',
        
      },
    ],
  },
 
  
];

export const layout = () => {
    // 处理树节点的点击事件
    const navigate = useNavigate();

  return {
    logo: 'https://img1.baidu.com/it/u=2683154888,3741468738&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
    navTheme: 'light',
    colorPrimary: '#1B499B',
    layout: 'top',
    contentWidth: 'Fluid',
    siderWidth:340,
    fixedHeader: false,
    fixSiderbar: true,
    colorWeak: false,
    title: 'AccoTest',
    pwa: false,
    pure: false,
    iconfontUrl: '',
    menu: {
      locale: false,
    },
    ignoreFlatMenu: false,
    // menuItemRender:(itemProps: MenuDataItem,defaultDom: any) => <Link to={itemProps.path} style={{display:'flex'}}>{itemProps.icon}{defaultDom}</Link>,
    // subMenuItemRender: (itemProps: MenuDataItem)=> <div style={{display: 'flex'}}><div>{itemProps.icon}</div><div>{itemProps.name}</div></div>,
    // menuDataRender : ()=>routes,
   
  };
};


// === Base URL ===
const apiEnv = process.env.API_ENV; // 获取环境
const OCR_APIS = {
  dev: 'http://localhost:8000',
  uat: 'https://accotest.uat.com',
  prod: 'https://accotest.prod.com',
};
const baseURL = !apiEnv ? 'http://localhost:8000' : OCR_APIS[apiEnv];
/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL,
  withCredentials: true,
   // 请求拦截器 请求之前为每个接口 加token
   requestInterceptors: [
    (config) => {
    // 拦截请求配置，进行个性化处理。
    // const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODI2NTgwNTYsImV4cCI6MTY4MjcxODA1Nn0.PeA1QX-sADDDY5FmS2BT0AD-1YBrQogic2wQq5EdR1k1111'
    const token = localStorage.getItem('token');  
    if (token) {  
      config.headers.Authorization = token
    }  
    return { ...config};
    }
  ],
  errorConfig: {
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.response) {
        // 已得到服务器响应，是否做状态处理
      } else if(error.request) {
        // 请求已经发起，并没得到服务器响应
      }else{
         //连接不到服务器
           notification.error({
            description: 'Server connection failure, please try later',
            message: 'failed',
          });
      }
    },
  },
};

