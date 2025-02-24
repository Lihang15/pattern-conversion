
//   import styles from './styles.less'
  import FloatingForm from "@/components/Form/FloatForm";
import { createProject } from "@/services/project/api";
import { message } from "antd";
import { history } from '@umijs/max';
import { me } from "@/services/account/api";
import { setCurrentAccount } from "@/utils/account";
  
  export default () => {
   const handleAddFormSubmit = (values: any)=>{
    const fetch = async ()=>{
      const {data,code} = await createProject(values)
      if(code===0){
        const account = await me({})
        setCurrentAccount(account.data)
        history.push('/')
      }else{
       message.error('error project')
      }
    }
   fetch()

   }
    return (
        <FloatingForm
        onClose={()=>{
           history.push('/login')
        }}
        onSubmit={handleAddFormSubmit}
      />
    );
  };
  