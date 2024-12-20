import { deleteCurrentAccount, deleteToken, getCurrentAccount } from "@/utils/account";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd"
import {history} from '@umijs/max'



const AvatarDropdown: React.FC = ()=>{
    const handleMenuClick = (event: any)=>{
        console.log('key',event.key);
        if(event.key === 'logout'){
            deleteCurrentAccount()
            deleteToken()
            history.push('/')
        }
     }
    const items: any = [
        { label: '用户信息', key: 'userinfo',icon: <UserOutlined />, onClick: handleMenuClick}, // 菜单项务必填写 key
        { label: '退出', key: 'logout', icon: <LogoutOutlined />, onClick: handleMenuClick},
      ];
    
    const currentAccount = getCurrentAccount()
    if(!currentAccount){
       return
    }
    return (
        <Dropdown menu = {{items}} >
            <span>
             <Avatar src = {currentAccount.avatar? currentAccount.avatar : 'https://img2.baidu.com/it/u=3582620703,2913479474&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'} alt="头像"/>
             <span>
                {currentAccount.username}
             </span>
             </span>

        </Dropdown>
    )

}

export default AvatarDropdown