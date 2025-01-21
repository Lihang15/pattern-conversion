import { ProTable } from "@ant-design/pro-components";
import { Input, message, Tabs, TabsProps, Upload, UploadProps } from "antd";
import React, { useState } from 'react';
import styles from './style.less';
import type { ProColumns } from '@ant-design/pro-components';
import {
  EditableProTable,
  ProCard,
  ProFormField,
} from '@ant-design/pro-components';
import { Button } from 'antd';

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
};

const defaultData: DataSourceType[] = new Array(10).fill(1).map((_, index) => {
  return {
    id: (Date.now() + index).toString(),
    title: `活动名称${index}`,
    decs: '这个活动真好玩',
    state: 'open',
    created_at: 1590486176000,
  };
});

const defaultPortData: DataSourceType[] = new Array(5).fill(1).map((_, index) => {
  return {
    id: (Date.now() + index).toString(),
    title: `Port${index}`,
    decs: 'test',
  };
});

const PinPortConfig = () => {
  // Pin Config
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>(
    () => defaultData,
  );
  const [backupData, setBackupData] = useState<readonly DataSourceType[]>(
    () => defaultData,
  ); // 用于存储重置时的数据
  const [isEditing, setIsEditing] = useState(false);


  const columns: ProColumns<DataSourceType>[] = [
    {
      title: 'Source Pattern Pin Name',
      dataIndex: 'title',
      width: '80%',
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: '此项是必填项',
          },
          {
            message: '必须包含数字',
            pattern: /[0-9]/,
          },
          {
            max: 16,
            whitespace: true,
            message: '最长为 16 位',
          },
          {
            min: 6,
            whitespace: true,
            message: '最小为 6 位',
          },
        ],
      },
    },
    {
      title: 'Ate Pin Name',
      dataIndex: 'decs',
    },
  ];

   // Port Config -----------------------------------------------------------

  const [portEditableKeys, setPortEditableRowKeys] = useState<React.Key[]>([]);
  const [portDataSource, setPortDataSource] = useState<readonly DataSourceType[]>(
    () => defaultData,
  );
  const [portBackupData, setPortBackupData] = useState<readonly DataSourceType[]>(
    () => defaultData,
  ); // 用于存储重置时的数据
  const [isPortEditing, setPortIsEditing] = useState(false);

  const portColumns: ProColumns<DataSourceType>[] = [
    {
      title: 'Port Name',
      dataIndex: 'title',
      width: '80%',
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: '此项是必填项',
          },
          {
            message: '必须包含数字',
            pattern: /[0-9]/,
          },
          {
            max: 16,
            whitespace: true,
            message: '最长为 16 位',
          },
          {
            min: 6,
            whitespace: true,
            message: '最小为 6 位',
          },
        ],
      },
    },
    {
      title: 'Op',
      dataIndex: 'decs',
    },
  ];
  const props: UploadProps = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const { Dragger } = Upload;
  const draggerProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div className={styles.config}>

     <div className={styles.pin_config}>
      <Dragger {...draggerProps}  style={{
            width: '100%',
            height: '100%',
            border: '1px dashed #1890ff',
            borderRadius: '1px',
            padding: '16px',
          }}>
        <EditableProTable<DataSourceType>
            bordered = {true}
        headerTitle="Pin Config"
        columns={columns}
        pagination={{}}
        rowKey="id"
        // scroll={{
        //     x: 960,
        // }}
        value={dataSource}
        onChange={setDataSource}
        recordCreatorProps={false
        }
        toolBarRender={() => {
            return [
              <Upload {...props}>
            
              <Button
              type="primary"
              key="add"
              onClick={() => {
              // setDataSource([
              //     ...dataSource,
              //     { id: Date.now(), title: '', decs: '' },
              // ]);
              }}
          >
              Upload
          </Button>
          </Upload>,
                     <Button
                     type="primary"
                     key="add"
                     onClick={() => {
                     setDataSource([
                         ...dataSource,
                         { id: Date.now(), title: '', decs: '' },
                     ]);
                     }}
                 >
                     Down
                 </Button>,
            <Button
                type="primary"
                key="add"
                onClick={() => {
                setDataSource([
                    ...dataSource,
                    { id: Date.now(), title: '', decs: '' },
                ]);
                }}
            >
                Add
            </Button>,
            <Button
                key="edit"
                type="primary"
                onClick={() => {
                setBackupData([...dataSource]); // 备份当前数据
                setEditableRowKeys(dataSource.map((item) => item.id)); // 启用所有行的编辑模式
                setIsEditing(true);
                }}
            >
                Edit
            </Button>,
            <Button
                type="primary"
                key="save"
                onClick={() => {
                setEditableRowKeys([]); // 禁用所有行的编辑模式
                setIsEditing(false);
                console.log(dataSource); // 保存数据的逻辑
                }}
            >
                Save
            </Button>,
            <Button
                type="primary"
                key="reset"
                onClick={() => {
                setDataSource([...backupData]); // 恢复备份的数据
                setEditableRowKeys([]); // 退出编辑模式
                setIsEditing(false);
                }}
            >
                Reset
            </Button>,
            ];
        }}
        editable={{
            type: 'multiple',
            editableKeys,
            actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
            },
            onValuesChange: (record, recordList) => {
            setDataSource(recordList);
            },
            onChange: setEditableRowKeys,
        }}
        />
             </Dragger>
     </div>


     <div className={styles.port_config}>
        <EditableProTable<DataSourceType>
          bordered = {true}
        headerTitle="Port Config"
        columns={portColumns}
        rowKey="id"
        // scroll={{
        //     x: 960,
        // }}
        value={defaultPortData}
        onChange={setPortDataSource}
        pagination={{}}
        recordCreatorProps={false
        }
        toolBarRender={() => {
            return [
              
            <Button
                type="primary"
                key="add"
                onClick={() => {
                setPortDataSource([
                    ...portDataSource,
                    { id: Date.now(), title: '', decs: '' },
                ]);
                }}
            >
                Add
            </Button>,
            <Button
                key="edit"
                type="primary"
                onClick={() => {
                setPortBackupData([...portDataSource]); // 备份当前数据
                setPortEditableRowKeys(portDataSource.map((item) => item.id)); // 启用所有行的编辑模式
                setPortIsEditing(true);
                }}
            >
                Upload
            </Button>,
            <Button
                type="primary"
                key="save"
                onClick={() => {
                setPortEditableRowKeys([]); // 禁用所有行的编辑模式
                setPortIsEditing(false);
                console.log(dataSource); // 保存数据的逻辑
                }}
            >
                Save
            </Button>,
            <Button
                type="primary"
                key="reset"
                onClick={() => {
                setPortDataSource([...portBackupData]); // 恢复备份的数据
                setPortEditableRowKeys([]); // 退出编辑模式
                setPortIsEditing(false);
                }}
            >
                Reset
            </Button>,
            ];
        }}
        editable={{
            type: 'multiple',
            editableKeys,
            actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
            },
            onValuesChange: (record, recordList) => {
            setPortDataSource(recordList);
            },
            onChange: setPortEditableRowKeys,
        }}
        />
        </div>

  </div>
  );
};

export default PinPortConfig;
