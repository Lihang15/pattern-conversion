import { useEffect } from 'react';
import { history, useParams }  from '@umijs/max';
import Pattern from '@/pages/Pattern';
import { getProjectDetail } from '@/services/project/api';

const PatternWrapper = (props: any) => {
  const {id} = useParams(); // 获取路径中的 `id`
  
  useEffect(() => {
    if (id===':id') {
       const fetchData = async () => {
          const respProject = await getProjectDetail({})
  
          const { code: projectCode, data: dataProject } = respProject
    
          if (projectCode !== 0) {
            return
          }
          const id = dataProject.projectInfo.id
          history.push(`/project/${id}/pattern`); // 如果直接访问 要重定向一下
     }
      fetchData()
    }
  }, []);

  return <Pattern />; // 继续渲染子组件
};

export default PatternWrapper;
