// 运行时配置
import './global.less'; // 确保引入全局样式

import { history, RequestConfig, useModel } from '@umijs/max';
import toggleSvg from './assets/images/toggle.svg'


import { Tooltip } from 'antd';
import Footer from './components/Footer';
import { getCurrentAccount } from './utils/account';
import { errorConfig } from './requestConfig';
import AvatarDropdown from './components/RightContent/AvatarDropdown';
export async function getInitialState(): Promise<any> {
  return getCurrentAccount();
}

export const layout = () => {
    // // 处理树节点的点击事件
    // const navigate = useNavigate();
    const { initialState, setInitialState } = useModel('@@initialState');

  return {
    logo: 'https://img1.baidu.com/it/u=2683154888,3741468738&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
    navTheme: 'light',
    colorPrimary: '#1B499B',
    layout: initialState?.layout || 'top', // 这里动态读取 layout 状态
    contentWidth: 'Fluid',
    siderWidth:340,
    fixedHeader: false,
    fixSiderbar: true,
    colorWeak: false,
    title: 'AccoTest',
    pwa: false,
    pure: false,
    iconfontUrl: 'https://img1.baidu.com/it/u=2683154888,3741468738&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
    menu: {
      locale: false,
    },
    // ignoreFlatMenu: false,
    // menuItemRender:(itemProps: MenuDataItem,defaultDom: any) => <Link to={itemProps.path} style={{display:'flex'}}>{itemProps.icon}{defaultDom}</Link>,
    // subMenuItemRender: (itemProps: MenuDataItem)=> <div style={{display: 'flex'}}><div>{itemProps.icon}</div><div>{itemProps.name}</div></div>,
    // menuDataRender : ()=>routes,
    footerRender: () => <Footer />,
    rightContentRender: () => <div style={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="切换布局" color = "#87d068">
      <img
        src={toggleSvg}
        alt=""
        onClick={() => {
          const newLayout = initialState?.layout === 'side' ? 'top' : 'side';
          setInitialState({ ...initialState, layout: newLayout });
        }}
        style={{ marginRight: 16, cursor: 'pointer' }}
      />
    </Tooltip>
    <AvatarDropdown />
  </div>,
    onPageChange: (location: any) => {
      // const { location } = history
      const currentAccount =  getCurrentAccount()
      if(!currentAccount){
           history.push('/login')
           return
      }
        if(!currentAccount.isHaveProject){
          history.push('/create_project')
          return
        }
      
    }
       
    
  };
};


// === Base URL ===
const apiEnv = process.env.API_ENV; // 获取环境
const OCR_APIS: any = {
  dev: 'http://10.5.33.192:8000',
  uat: 'https://accotest.uat.com',
  prod: 'https://accotest.prod.com',
};
const baseURL = !apiEnv ? 'http://10.5.33.192:8000' : OCR_APIS[apiEnv];
/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL,
  withCredentials: true,
   ...errorConfig
};

