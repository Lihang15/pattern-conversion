import { ProDescriptions } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import styles from './styles.less'
import { getCurrentAccount } from '@/utils/account';

export default () => {
    const currentAccount = getCurrentAccount()
  return (
    <div className={styles.container}>
    <ProDescriptions
      column={2}
      title="用户基本信息"
      tooltip="用户由管理员分配，并给予相应权限"
    >
      <ProDescriptions.Item
        span={2}
        valueType="text"
        contentStyle={{
          maxWidth: '80%',
        }}
        ellipsis
        label="用户名"
      >
        {currentAccount.username}
      </ProDescriptions.Item>


      <ProDescriptions.Item label="创建时间" valueType="dateTime">
        {dayjs(currentAccount.createdAt).format('YYYY-MM-DD HH:mm:ss')}
      </ProDescriptions.Item>
      <ProDescriptions.Item
        label="角色"
      >
        {currentAccount.roles.toString()}
      </ProDescriptions.Item>

            
            
      <ProDescriptions.Item

        label="是否有创建项目"
      >
        {currentAccount.isHaveProject?'是':'否'}
      </ProDescriptions.Item>
      <ProDescriptions.Item
        valueType="text"

        label="是否是超级管理员"
      >
        {currentAccount.roles.includes('Admin')?'是':'否'}
      </ProDescriptions.Item>



      
 
  
    </ProDescriptions>
    </div>


  );
};