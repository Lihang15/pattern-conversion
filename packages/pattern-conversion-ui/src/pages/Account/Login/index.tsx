import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import styles from './styles.less'
import { login, me } from '@/services/account/api';
import { setCurrentAccount, setToken } from '@/utils/account';
import { history, useModel } from '@umijs/max';
import { Card, message } from 'antd';
import Footer from '@/components/Footer';

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
const handleFinish = (values: any)=>{
   const fetch = async ()=>{
     const {data,code} = await login(values)
     if(code===0){
       setToken(data.token)
       // 获取用户信息
       const account = await me({})
       setCurrentAccount(account.data)
       setInitialState(account.data)
       history.push('/')
     }else{
      message.error('用户名或密码错误')
     }
   }
  fetch()
    
    
}
  return (
      <div className={styles.container}>
        <div className={styles.bgcFont}></div>
        <div className= {styles.rightHalf} >
       
          <div className={styles.content}>
            <LoginForm
              title="Pattern Conversion Platform"
              onFinish={handleFinish}
            >
              <ProFormText
                name="email"
                label="邮箱"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={ styles.prefixIcon} />,
                }}
                placeholder={'邮箱'}
                rules={[{ required: true, message: '请输入邮箱!' }]}
              />
              <ProFormText.Password
                name="password"
                label="密码"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={ styles.prefixIcon} />,
                }}
                placeholder={'密码'}
                rules={[{ required: true, message: '请输入密码！' }]}
              />

              <div  className={styles.login_options}>
                {/* <ProFormCheckbox noStyle name="autoLogin">
                  自动登录
                </ProFormCheckbox> */}
                <a className="forgot-password">forget password</a>
              </div>
            </LoginForm>
            <Footer />
          </div>
        </div>
    
      </div>
      
  );
};
