import { DownOutlined, ReloadOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Space, Table, Tag } from "antd";
import type { TableProps } from 'antd';
import { FC, useRef, useState } from "react";
import styles from './styles.less';
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "./components/UpdateForm";
import { ActionType } from "@ant-design/pro-components";


const Poject: FC<any> = () => {
  // 点击转换分步表单
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [stepFormValues, setStepFormValues] = useState({});

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
            if(tag === 'down'){
              color = 'green';
            }
            if(tag==='ongoing'){
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
      width:'10%',
      render: (_, record) => (
        <Space size="middle">
          <a>Invite</a>
          <a>Delete</a>
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
      key: '1',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['new'],
    },
    {
      key: '1',
      fileName: 'xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      path: 'C:/pattern-file/xaxaaxaxx_u_ddr5_lasxl_v2.wgl.gz',
      updatedAt: '2024-11-27 16:43:12',
      status: ['done'],
    },
  ];
  


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
            handleUpdateModalVisible(true);
            console.log('strp');

          }}>Run conversion</Button>
        </div>


      </div>

      <div className={styles.line}></div>
    </div>
    <div className={styles.content_area}>
      <div className={styles.content_area_top}>
          
          <div className={styles.check}>
              <p>Project Checker</p>
              <div>
              <div className={styles.check_left}>
                 <div>
                    <div>
                        pattern 总数
                    </div>
                    <div>
                        未转换的pattern数
                    </div>
                 </div>
            
              </div>
              <div className={styles.check_right}>
                      转换次数
                 </div>
              </div>
        
          </div>
          <div className={styles.svg}>
                tu
          </div>
      </div>
      <div className={styles.content_area_bottom}>
         <Table<DataType> columns={columns} dataSource={data} size="small"/>
      </div>

    </div>
    <div className={styles.terminal_output}>
      <TerminalOutput />
    </div>


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


  </div>
}

export default Poject