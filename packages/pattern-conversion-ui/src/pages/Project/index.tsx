import { DownOutlined, ReloadOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Progress, Space, Table, Tag } from "antd";
import type { ProgressProps, TableProps } from 'antd';
import { FC, useEffect, useRef, useState } from "react";
import styles from './styles.less';
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "./components/UpdateForm";
import { ActionType, ProCard, ProTable } from "@ant-design/pro-components";
import { Bar, Pie } from '@ant-design/plots';
import { startPatternConversion } from '@/services/project/api';

const Poject: FC<any> = () => {
  // 点击转换分步表单
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [isProgressing,setIsProgressing] = useState<boolean>(true)
  const actionRef = useRef<ActionType>();
  const [stepFormValues, setStepFormValues] = useState({});
  // useEffect(()=>{
  //   async function fetData() {
  //     const data  =  await startPatternConversion({})
  //     console.log('data',data);
      
  //     // setProject(data)
  //  }
  //  fetData()
  // },[])
  
  const[processPercent, setProcessPercent] = useState<number>(1)
  // setInterval(()=>{
  //   setProcessPercent((p)=>{return p+10})
  // },3000)
  let step = 1
  useEffect(() => {
    // const progressInterval  = setInterval(() => {
      
    //   if (processPercent===100) {
    //     clearInterval(progressInterval);
    //   }
    //   if(step===99){
    //     clearInterval(progressInterval);
    //   }
    //   setProcessPercent(step++)
    // }, 10);
    const eventSource = new EventSource('http://localhost:7001/api/projects/start_pattern_conversion',{ withCredentials: true });
 
    eventSource.onmessage = (event) => {
      // console.log('Received event:', event); // 查看整个事件对象
      // console.log('Received event data:', event.data); // 查看事件的原始数据

      try {
        
        const logMessage = event.data;
        const { process } = JSON.parse(logMessage); // 确保 JSON 数据格式正确
        // if(process===100){
        //   setProcessPercent(process)
        // }
        setProcessPercent(process)

        
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('Error receiving logs:', error);
      console.log('EventSource readyState:', eventSource.readyState);
      eventSource.close();
    };
  
    return () => {
      eventSource.close();
    };
  }, []);
  useEffect(() => {
    console.log('processPercent',processPercent);
    
  }, [processPercent]);


  // 项目下拉选项
  const items: MenuProps['items'] = [

    {
      key: '2',
      label: 'project2',
    },
    {
      key: '3',
      label: 'project3',
    },

  ];

  // 表格列和数据
  interface DataType {
    key: string;
    fileName: string;
    path: string;
    status: string[];
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
      render: (_, { status }) => (
        <>
          {status.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'new') {
              color = 'volcano';
            }
            if (tag === 'down') {
              color = 'green';
            }
            if (tag === 'ongoing') {
              color = 'geekblue';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
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

  const data: DataType[] = [
    {
      key: '1',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['ongoing'],
    },
    {
      key: '2',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['new'],
    },
    {
      key: '3',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
    {
      key: '4',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
    {
      key: '5',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['new'],
    },
    {
      key: '6',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
    {
      key: '7',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
    {
      key: '8',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['new'],
    },
    {
      key: '9',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
    {
      key: '10',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },

  ];
   // 饼图
  const config = {
    data: [
      { type: '.wgl数量', value: 5 },
      { type: 'wgl.gz数量', value: 5 },
      { type: '.stil数量', value: 7 },
    ],
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };
  // 柱状图
  const barConfig = {
    data: [
      { type: 'new', value: 3 },
      { type: 'done', value: 5 },
      { type: 'changed', value: 5 },
      { type: 'failed', value: 10 },
    ],
    scale: {
      x: { 
        type:'band',
        /* 其他配置项 */ 
        padding:0.4
      }
    },
    xField: 'type',
    yField: 'value',
    colorField: 'type',
    state: {
      unselected: { opacity: 0.5 },
      selected: { lineWidth: 1, stroke: 'red' },
    },
    interaction: {
      elementSelect: true,
    },
    label: {
      type: 'inner',
      content: '',
    },
    onReady: ({ chart, ...rest }) => {
      chart.on(
        'afterrender',
        () => {
          const { document } = chart.getContext().canvas;
          const elements = document.getElementsByClassName('element');
          elements[0]?.emit('click');
        },
        true,
      );
    },
  };
  return <div className={styles.container}>
    <div className={styles.operating_area}>
      <div className={styles.operating_buttons}>
        <div className={styles.operating_buttons_left}>
          <Dropdown menu={{ items }} >
            <a onClick={(e) => e.preventDefault()} className={styles.drop_menu}>
              <Space>
                project1
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>

          <a onClick={(e) => e.preventDefault()} className={styles.refresh_svg}>
            <ReloadOutlined />
          </a>

          <a onClick={(e) => e.preventDefault()}>
            <ZoomInOutlined />
          </a>


        </div>
        <div className={styles.operating_buttons_right}>
          <Button type="primary" onClick={() => {
            // handleUpdateModalVisible(true);
            setIsProgressing(true)
            // console.log('strp');

          }}>Run conversion</Button>
        </div>


      </div>

      <div className={styles.line}></div>
    </div>
    <div className={styles.content_area}>
    <div className={styles.content_area_left}>
        {/* <Table<DataType> columns={columns} dataSource={data} /> */}
        <ProTable<DataType> columns={columns} dataSource={data} />
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
           <Bar {...barConfig} />
           </div>
           </ProCard>
           <ProCard>
           <div className={styles.svg_pie}>
           <p>pattern count</p>
           <Pie {...config} />
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
          const success = true
          if (success) {
            handleUpdateModalVisible(false);
            setStepFormValues({});
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setStepFormValues({});
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



  </div>
}

export default Poject