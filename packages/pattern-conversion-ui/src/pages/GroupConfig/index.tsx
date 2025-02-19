import { Card, message, Switch, Upload } from "antd";
import React, { useEffect, useState } from 'react';
import styles from './style.less';
import type { ProColumns } from '@ant-design/pro-components';
import {
  EditableProTable,
} from '@ant-design/pro-components';
import type { MenuProps, UploadProps } from 'antd';
import { Menu } from 'antd';
import uploadSvg from '../../assets/images/table-header/upload.svg'
import downloadSvg from '../../assets/images/table-header/download.svg'
import saveSvg from '../../assets/images/table-header/save.svg'
import restSvg from '../../assets/images/table-header/reset.svg'
import editSvg from '../../assets/images/table-header/edit.svg'
import setSvg from '../../assets/images/set.svg'
import { getToken } from "@/utils/account";
import { downloadSetupFile, getPatternGroupDetail, updatePatternGroup } from "@/services/patternGroup/api";

type DataSourceType = {
  id: number;
  value: any,
  parameter: string
};

// 拿到原始json数据
// const setupConfig = {
//   port_config: 'C:\\Users\\lihan\\Desktop\\pattern-conversion\\test',
//   rename_signals: 'flnskdbnksbckjancka',
//   exclude_signals: 'cacasnanclnalcnalsc',
//   optimize_drive_edges: 1,
//   optimize_receive_edges: 1,
//   pattern_comments: 'on',
//   repeat_break: 0,
//   equation_based_timing: 1,
//   add_scale_spec: 0,
//   label_suffix: '',
// };


// 还原表格数据成原始数据
const restoreConfig = (tableData: DataSourceType[]): Record<string, any> => {
  return tableData.reduce((config, item) => {
    config[item.parameter] = item.value;
    return config;
  }, {} as Record<string, any>);
};

const GroupConfig: React.FC<any> = ({ groupList, projectId } ) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const [dataSource, setDataSource] = useState<DataSourceType[]>(); // 源数据
  const [backupData, setBackupData] = useState<DataSourceType[]>(); // 用于存储重置时的数据
  const [isEditing, setIsEditing] = useState(false); //是否正在编辑
  const [isUpdateRowError, setIsUpdateRowError] = useState(false);

  // 根据id获取group的信息，默认第一个，可以切换
  useEffect(()=>{
    const fetch = async()=>{
      const resp  = await getPatternGroupDetail({id: groupList[0].key})
      const { code, message: errorMessage, data } = resp
    
      if (code !== 0) {
        message.error(errorMessage)
        return
      }
      // 还原成[{id:1,parameter:'port_config',value:'C:\\Users\\lihan\\Desktop\\pattern-conversion\\test'}]
      const handleTableData: DataSourceType[] = Object.entries(data.setupConfig).map(([key, value], index) => ({
        id: index, // 唯一的 key 值
        parameter: key, // 参数名称
        value: value, // 参数值
      }));
      setDataSource(handleTableData)
      setBackupData(handleTableData)
    }
    fetch()
},[])
  const columns: ProColumns<DataSourceType>[] = [
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      width: '40%',
      editable: false,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      formItemProps: (form, record) => {
        return {
          rules: [
            {
              required: true,
              message: 'Value is required',
            },
            {
              validator: (_, value) => {
                if (record.entity.parameter === 'label_suffix' && !/^wang/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('Value must be "expected_value" for specific_parameter'));
                }
                if (record.entity.parameter === 'port_config' && !/^[\x00-\xff\.\\\,\:]+$/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('请输入一个合法路径'));
                }
                if (record.entity.parameter === 'rename_signals' && !/^[\x00-\xff\.\\\:]*$/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('请输入一个合法路径'));
                }
                if (record.entity.parameter === 'exclude_signals' && !/^[\x00-\xff\.\\\:]*$/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('请输入一个合法路径'));
                }
                if (record.entity.parameter === 'optimize_drive_edges') {
                  if(parseInt(value)!==0&&parseInt(value)!==1){
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字范围在0 或者 1'));
                  }
          
                }
             
                setIsUpdateRowError(false)
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
  ];

  // const handleAdd = () => {
  //   const newRow = { id: 100, parameter: '', value: '' };
  //   setDataSource([...dataSource, newRow]);
  //   setEditableRowKeys([...editableKeys, newRow.id]); // 添加新行到可编辑列表
  // }
  const handleSave = () => {
    if(isUpdateRowError){
      // message.error({content:<div style={{ backgroundImage: 'linear-gradient(120deg, rgb(38, 89, 207), rgb(211, 104, 107))',borderRadius:8, 
      //   boxShadow:`0 4px 6px rgba(0, 0, 0, 0.4)`,padding:13,width:300,height:50,color:'#333' }}>把错误改正</div>})
      message.error('把错误更正')
      return
    }
    setEditableRowKeys([]); // 禁用所有行的编辑模式
    setIsEditing(false);
    const resoreDataSource = restoreConfig(dataSource as DataSourceType[])
    console.log(resoreDataSource); // 保存数据的逻辑

    const fetch = async()=>{
      const currentOpenKey = stateOpenKeys[0]
      console.log('currentOpenKey',currentOpenKey);
      const respGroup  = await updatePatternGroup({id: currentOpenKey},{setupConfig: resoreDataSource})
      const { codeGroup } = respGroup
    
      if (codeGroup !== 0) {
        return
      }

      const resp  = await getPatternGroupDetail({id: currentOpenKey})
      const { code, data } = resp
    
      if (code !== 0) {
        return
      }
      // 还原成[{id:1,parameter:'port_config',value:'C:\\Users\\lihan\\Desktop\\pattern-conversion\\test'}]
      const handleTableData: DataSourceType[] = Object.entries(data.setupConfig).map(([key, value], index) => ({
        id: index, // 唯一的 key 值
        parameter: key, // 参数名称
        value: value, // 参数值
      }));
      setDataSource(handleTableData)
      setBackupData(handleTableData)
    }
    fetch()
    
  }

  const handleEdit = () => {
    if(dataSource){
      setBackupData([...dataSource]); // 备份当前数据
      console.log('222',dataSource);
      setEditableRowKeys(dataSource.map((item) => item.id)); // 启用所有行的编辑模式
      setIsEditing(true);

    }
   
  }

  const handleReset = () => {
    if(backupData){
      setDataSource([...backupData]); // 恢复备份的数据
      console.log('1111',dataSource);
      
      setEditableRowKeys([]); // 退出编辑模式
      setIsEditing(false);
    }
    
  }

  const handleUpload = () => {

  }
  const handleDownload = () => {
    try {
      const fetch = async ()=>{
      const response = await downloadSetupFile({})
      
      
     let objectUrl = URL.createObjectURL(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); // 创建URL
     const link = document.createElement('a');
     link.href = objectUrl;
     link.download = 'core_setup_template.xlsx'; // 自定义文件名
     link.click(); // 下载文件
     URL.revokeObjectURL(objectUrl); // 释放内存
    }
    fetch()

    } catch (error) {
      message.error('文件下载失败:');
    } finally {
    }

  }

  //menu-----------------------------------------------------------------------

  type MenuItem = Required<MenuProps>['items'][number];

  // 后端返回的数据
  // const groupList = [
  //   { key: '1', groupName: 'G1' },
  //   { key: '2', groupName: 'G2' },
  //   { key: '3', groupName: 'Group G3' },
  // ];

  // 用于动态切换enableTimingMerge
  const [switchState, setSwitchState] = useState(
    groupList.reduce((acc: any, group: any) => {
      acc[group.key] = group.enableTimingMerge; // 初始化状态
      return acc;
    }, {} as Record<string, boolean>)
  );
  
  const handleSwitchChange = async (checked: boolean, groupKey: string)=>{
    const {code, message: errorMessage}  = await updatePatternGroup({id: groupKey},{enableTimingMerge: checked})
    if(code!==0){
      message.error(errorMessage)
      return
    }
    setSwitchState((prev: any) => ({
      ...prev,
      [groupKey]: checked,
    }));
    message.success('enableTimingMerge 切换成功')
  }
  // 动态生成 MenuItem 数据
const createMenuItems = (groups: { key: string; groupName: string,enableTimingMerge: boolean }[]): MenuItem[] => {
  return groups.map((group) => ({
    key: group.key,
    icon: <img src={setSvg} alt="" />,
    label: group.groupName,
    children: [
      {
        key: `${group.key}-child`, // 唯一 key
        label: (
          <div>
            Timing Merge

            <Switch size="small" checked={switchState[group.key]} onChange={(checked) => handleSwitchChange(checked, group.key)}  style={{ marginLeft: 10 }} />
          </div>
        ),
      },
    ],
  }));
};

  // const items: MenuItem[] = [
  //   {
  //     key: '1',
  //     icon: (<img src={setSvg} alt="" />),
  //     label: 'G1',
  //     children: [
  //       {
  //         key: '21', label: (<div>

  //           Timing Merge<Switch size="small" defaultChecked style={{ marginLeft: 10 }} />
  //         </div>)
  //       },
  //     ],
  //   },
  //   {
  //     key: '2',
  //     icon: (<img src={setSvg} alt="" />),
  //     label: 'G2',
  //     children: [
  //       {
  //         key: '21', label: (
  //           <div>

  //             Timing Merge<Switch size="small" defaultChecked style={{ marginLeft: 10 }} />
  //           </div>
  //         )
  //       },
  //     ],
  //   },
  //   {
  //     key: '3',
  //     icon: (<img src={setSvg} alt="" />),
  //     label: 'Group G3',
  //     children: [
  //       {
  //         key: '31', label: (<div>

  //           Timing Merge<Switch size="small" defaultChecked style={{ marginLeft: 10 }} />
  //         </div>)
  //       },
  //     ],
  //   },
  // ];
const items: MenuItem[] = createMenuItems(groupList);
  interface LevelKeysProps {
    key?: string;
    children?: LevelKeysProps[];
  }

  const getLevelKeys = (items1: LevelKeysProps[]) => {
    const key: Record<string, number> = {};
    const func = (items2: LevelKeysProps[], level = 1) => {
      items2.forEach((item) => {
        if (item.key) {
          key[item.key] = level;
        }
        if (item.children) {
          func(item.children, level + 1);
        }
      });
    };
    func(items1);
    return key;
  };

  const levelKeys = getLevelKeys(items as LevelKeysProps[]);
  const [stateOpenKeys, setStateOpenKeys] = useState([`${groupList[0].key}`]);

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
   
    
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    console.log('currentOpenKey',currentOpenKey);
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
      //  处理数据切换
      const fetch = async()=>{
        const resp  = await getPatternGroupDetail({id: currentOpenKey})
        const { code, data } = resp
      
        if (code !== 0) {
          return
        }
        // 还原成[{id:1,parameter:'port_config',value:'C:\\Users\\lihan\\Desktop\\pattern-conversion\\test'}]
        const handleTableData: DataSourceType[] = Object.entries(data.setupConfig).map(([key, value], index) => ({
          id: index, // 唯一的 key 值
          parameter: key, // 参数名称
          value: value, // 参数值
        }));
        setDataSource(handleTableData)
        setBackupData(handleTableData)
      }
      fetch()

      
    } else {
      // close
      setStateOpenKeys(openKeys);
      console.log('closeKeys',openKeys);
    }
  };

  const token = getToken()
  const props: UploadProps = {
    name: 'files',
    action: `/api/project/pattern/setup/upload?projectId=${projectId}&groupId=${stateOpenKeys[0]}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
            // 上传成功后的处理逻辑
            message.success(`${info.file.name} file uploaded successfully`);
            const response = info.file.response; // 假设服务端返回文件内容
            // console.log('resp+++++++++++++',response);
            
            if (response && response.data) {
              try {
                // 假设返回的数据是 JSON 字符串，解析并更新表格数据
                // const uploadedData = JSON.parse(response.data); // 服务端返回的文件内容
                // const formattedData = Object.entries(uploadedData).map(([key, value], index) => ({
                //   id: index,
                //   parameter: key,
                //   value: value,
                // }));
                //  处理数据切换
                  const fetch = async()=>{
                 
                    const resp  = await getPatternGroupDetail({id: stateOpenKeys[0]})
                    const { code, data } = resp
                  
                    if (code !== 0) {
                      return
                    }
                    // 还原成[{id:1,parameter:'port_config',value:'C:\\Users\\lihan\\Desktop\\pattern-conversion\\test'}]
                    const handleTableData: DataSourceType[] = Object.entries(data.setupConfig).map(([key, value], index) => ({
                      id: index, // 唯一的 key 值
                      parameter: key, // 参数名称
                      value: value, // 参数值
                    }));
                    setDataSource(handleTableData)
                    setBackupData(handleTableData)
                  }
                  fetch()
              } catch (error) {
                message.error('Failed to parse uploaded file content');
              }
            }
          } else if (info.file.status === 'error') {
            // http状态码不是200，自动识别为error
            message.error(`${info.file.name} file upload failed.`);
          }
    },
  };
  const { Dragger } = Upload;


  return (
    <div className={styles.group_config}>

      <div className={styles.left}>
        <Card title='Group Name'>
          <Menu
            mode="inline"
           
            openKeys={stateOpenKeys}
            onOpenChange={onOpenChange}
            style={{ width: 256 }}
            items={items}
          />
        </Card>
      </div>

      <div className={styles.right}>
        <EditableProTable<DataSourceType>
          bordered={true}
          headerTitle='Core Parameter Config'
          columns={columns}
          rowKey="id"
          defaultSize="small" // 设置默认表格密度为紧凑型
          scroll={{
            x: 960,
          }}
          value={dataSource}
          // onChange={setDataSource}
          recordCreatorProps={false
          }
          toolBarRender={() => {
            return [
                <div>
                    <Dragger {...props}>
                    <img src={uploadSvg} onClick={() => {
                    handleUpload()
                  }} />
                  </Dragger>
                </div>
               ,
          
              <img src={downloadSvg} onClick={() => {
                handleDownload()
              }} />,
              // <img src={addSvg} onClick={() => {
              //   handleAdd()
              // }} />,
              <img src={editSvg} onClick={() => {
                handleEdit()
              }} />,
              <img src={saveSvg} onClick={() => {
                handleSave()
              }} />,
              <img src={restSvg} onClick={() => {
                handleReset()
              }} />,

            ];
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            // actionRender: (row, config, defaultDoms) => {
            //   return [defaultDoms.delete];
            // },
            onValuesChange: (record, recordList) => {
   
              setDataSource(recordList);
            },
            // onChange: setEditableRowKeys,
          }}
        />
      </div>

    </div>
  );
};

export default GroupConfig;



