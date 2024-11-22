
import TerminalOutput from '@/components/TerminalOutput';
import { projectList } from '@/services/project/api';
import { useEffect, useState } from 'react';
import { useLocation } from 'umi'; 

const GlobalHeaderRight: React.FC<any> = ({}) => {
    const location = useLocation()
    const { pathname } = location
    // if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    //   className = `${styles.right}  ${styles.dark}`;
    // }
    const [project, setProject] = useState({})
    useEffect(()=>{
        async function fetData() {
           const { data}  =  await projectList({})
           console.log('data',data);
           
           setProject(data)
        }
        fetData()
    },[])
    return (
        <div>{pathname}
        {project[0]?.projectName}
        </div>
       
    );
  };

  export default GlobalHeaderRight