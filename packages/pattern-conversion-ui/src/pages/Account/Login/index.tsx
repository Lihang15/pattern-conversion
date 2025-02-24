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
  const handleFinish = (values: any) => {
    const fetch = async () => {
      const { data, code } = await login(values)
      if (code === 0) {
        setToken(data.token)
        // 获取用户信息
        const account = await me({})
        setCurrentAccount(account.data)
        setInitialState(account.data)
        history.push('/')
      } else {
        message.error('The user name or password is incorrect')
      }
    }
    fetch()


  }
  return (
    <div className={styles.container}>
      <div className={styles.bgcFont}></div>
      <div className={styles.rightHalf} >

        <div className={styles.content}>
          <LoginForm
            title="Pattern Conversion Platform"
            onFinish={handleFinish}
          >
            <ProFormText
              name="email"
              label="Email"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Email'}
              rules={[{ required: true, message: 'Please enter email!' }, 
                {
                max: 30,
                message: 'Email cannot exceed 30 characters!',
              },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Email is invalid'
            }
            ]}
            />
            <ProFormText.Password
              name="password"
              label="Password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Password'}
              rules={[{ required: true, message: 'Please enter password！' },{
                max: 30,
                message: 'Password cannot exceed 30 characters!',
              },]}
            />

            <div className={styles.login_options}>
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
