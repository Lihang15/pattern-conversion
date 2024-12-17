import { DownOutlined, ReloadOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Progress, Space, Table, Tag } from "antd";
import { ProgressProps, TableProps, message } from 'antd';
import { FC, useEffect, useRef, useState } from "react";
import styles from './styles.less';
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "../../components/Form/StepForm";
import { ActionType, ProCard, ProTable } from "@ant-design/pro-components";
import BarChart from '@/components/Charts/Bar'
import PieChart from '@/components/Charts/Pie'
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { createProject, projectProjectDashboard, startPatternConversion, updateProject } from '@/services/project/api';
import FloatingForm from "@/components/Form/FloatForm";

const Poject: FC<any> = () => {
  // 点击转换显示分步表单
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();

  //进度条
  const [isProgressing,setIsProgressing] = useState<boolean>(false)
  const[processPercent, setProcessPercent] = useState<number>(1)

  //项目数据
  const [resources, setResources] = useState();

  //添加项目
  
  const [isAddProject, setIsAddProject] = useState<any>(false)
  const handleAddFormSubmit = (values) => {
    console.log('表单提交数据:', values);
    const fetchData1 = async () => {
      const resp1 = await projectProjectDashboard({})
      const { code, data } = resp1
      if(code===0){
        // const {resources,projectDropList} = data
        setResources(data)
        setStepFormValues({projectName: data.projectDropList[0].label})
      }
    };
    const fetchData = async () => {
      const resp = await createProject(values)
      const { code, message: m, data } = resp
      if(code===0){
        setIsAddProject(false); // 提交成功后关闭浮层
        await fetchData1()
      }else{
        message.error(m);
      }   
    };
    fetchData();
   
  };

  const handleProcess = (value: any)=>{
    setIsProgressing(true)
    const eventSource = new EventSource('http://10.5.33.192:7001/api/projects/start_pattern_conversion',{ withCredentials: true });
    eventSource.onmessage = (event) => {
      // console.log('Received event:', event); // 查看整个事件对象
      // console.log('Received event data:', event.data); // 查看事件的原始数据
      try {
        const logMessage = event.data;
        const { process } = JSON.parse(logMessage); // 确保 JSON 数据格式正确
        setProcessPercent(process)
        
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error receiving logs:', error);
      console.log('EventSource readyState:', eventSource.readyState);
      eventSource.close();
      setIsProgressing(false)
      setProcessPercent(1)
    };


  }
  useEffect(() => {
    const fetchData = async () => {
      const resp = await projectProjectDashboard({})
      const { code, data } = resp
      if(code===0){
        setResources(data)
        setStepFormValues({projectName: data.projectDropList[0].label})
      }   
    };
    fetchData();
  }, []);

  // 项目下拉选项
  const handleMenuClick = ({ key }: any) => {
  
    const fetchData = async () => {
      await updateProject({id: clickedItem?.key},{isCurrent: true})
  
      const resp1 = await projectProjectDashboard({})
      const { code, data } = resp1
      if(code===0){
        // const {resources,projectDropList} = data
        setResources(data)
        setStepFormValues({projectName: data.projectDropList[0].label})
      }
    };
    // 点击切换项目时候触发
    const clickedItem = resources?.projectDropList.find((item) => parseInt(item.key) === parseInt(key));
    if(clickedItem){
      fetchData();
    }
  };

  const menu = {
    items: resources?.projectDropList.map(item => ({
      ...item,
      onClick: handleMenuClick,
    })),
  };

  // 表格列和数据
  interface DataType {
    key: string;
    fileName: string;
    path: string;
    status: string;
    updatedAt: string;
  }
  const twoColors: ProgressProps['strokeColor'] = {
    '0%': '#108ee9',
    '100%': '#87d068',
  };

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      width: '20%',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'File Path',
      dataIndex: 'path',
      key: 'path',
      width: '40%',
    },

    {
      title: 'Status',
      key: 'status',
      width: '10%',
      dataIndex: 'status',
      render: (_, { status }) => {
        // 根据状态设置颜色
        const getColor = (status) => {
          switch (status) {
            case 'new':
              return 'volcano';
            case 'down':
              return 'green';
            case 'ongoing':
              return 'geekblue';
            default:
              return 'gray'; // 未知状态时的默认颜色
          }
        };
    
        return (
          <Tag color={getColor(status)}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    
    {
      title: 'DateTime',
      dataIndex: 'updatedAt',
      width: '20%',
      key: 'updatedAt',
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <a>conversion log</a>
          {/* <a>Delete</a> */}
        </Space>
      ),
    },
  ];

  // const data: DataType[] = [
  //   {
  //     key: '1',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['ongoing'],
  //   },
  //   {
  //     key: '2',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['new'],
  //   },
  //   {
  //     key: '3',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },
  //   {
  //     key: '4',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },
  //   {
  //     key: '5',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['new'],
  //   },
  //   {
  //     key: '6',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },
  //   {
  //     key: '7',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },
  //   {
  //     key: '8',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['new'],
  //   },
  //   {
  //     key: '9',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },
  //   {
  //     key: '10',
  //     fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
  //     updatedAt: '2024-11-27 16:43:12',
  //     status: ['done'],
  //   },

  // ];
   // 饼图


  return <div className={styles.container}>
    <div className={styles.operating_area}>
      <div className={styles.operating_buttons}>
        <div className={styles.operating_buttons_left}>
          <Dropdown menu={ menu } className={styles.drop_menu}>
            <Space>
              <div>
              {resources?.projectDropList[0].label || 'Loading...'}
              </div>
             
                <DownOutlined />
              </Space>
          </Dropdown>

          <a onClick={(e) => e.preventDefault()} className={styles.refresh_svg}>
            <ReloadOutlined />
          </a>

          <a onClick={(e) => setIsAddProject(true) }>
            <ZoomInOutlined />
          </a>


        </div>
        <div className={styles.operating_buttons_right}>
          <Button type="primary" onClick={() => {
            handleUpdateModalVisible(true);
            // setIsProgressing(true)
            // console.log('strp');

          }}>Run conversion</Button>
        </div>


      </div>

      <div className={styles.line}></div>
    </div>
    <div className={styles.content_area}>
    <div className={styles.content_area_left}>
        {/* <Table<DataType> columns={columns} dataSource={data} /> */}
        <ProTable<DataType> columns={columns} dataSource={resources?.resources} />
      </div>

      <div className={styles.content_area_right}>
       <ProCard>
        <div className={styles.check}>
          <p>project checker</p>
          <div className={styles.pattern_text}>
            <div className={styles.check_left}>
            
                <div className={styles.pattern_count}>
                  pattern 总数：10
                </div>
                <div className={styles.pattern_conversion}>
                    <div className={styles.pattern_conversioned}>
                    已转换的pattern数：7
                    </div>
                    <div className={styles.pattern_not_conversion}>
                    未转换的pattern数:：3
                    </div>
                 
                 
                </div>
             

            </div>
            <div className={styles.check_right}>
          
               <div className={styles.pattern_conversion_count}>
                      转换向量次数：5
               </div>
               <div className={styles.pattern_conversion_success}>
                      成功次数：3
              </div>
              <div className={styles.pattern_conversion_failed}>
                      失败次数：2
              </div>
              <div className={styles.pattern_conversion_last_time}>
                      项目创建时间：2024-11-29 14:15:50
              </div>
              <div className={styles.pattern_conversion_last_time}>
                      最后转换时间：2024-11-29 14:15:50
              </div>
              
            </div>
          </div>
         
        </div>
        </ProCard>
        <div className={styles.svg}>
        <ProCard>
        <div className={styles.svg_bar}>
       
          <p>pattern status</p>
           <BarChart />
           </div>
           </ProCard>
           <ProCard>
           <div className={styles.svg_pie}>
           <p>pattern count</p>
           <PieChart />
           </div>
        
           </ProCard>
         
        </div>
      </div>

    </div>
    {/* <div className={styles.terminal_output}>
      <TerminalOutput />
    </div> */}


    {updateModalVisible && (
      <UpdateForm
        onSubmit={async (value) => {
          console.log('value',value);
          if (value) {
            handleUpdateModalVisible(false);
            handleProcess(value)
            // setStepFormValues({});
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          // setStepFormValues({});
        }}
        updateModalVisible={updateModalVisible}
        values={stepFormValues}
      />
    )}
    {
      isProgressing && (
        <div className={styles.process_area}>

          <div className={styles.process}>
            <p>
            正在转换中，请耐心等待，不要刷新页面，避免转换失败
            </p>
            <Progress type="circle" percent={processPercent} strokeColor={twoColors} />
          </div>
  
      </div>
      )
    }

    {
      isAddProject &&(
        <FloatingForm
        onClose={() => setIsAddProject(false)}
        onSubmit={handleAddFormSubmit}
      />
      )
    }

  </div>
}

export default Poject