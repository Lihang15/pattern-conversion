import { Button, Card, Form, message, Switch, Tooltip, Upload } from "antd";
import React, { useEffect, useState } from 'react';
import styles from './style.less';
import type { ProColumns } from '@ant-design/pro-components';
import {
  EditableProTable,
  ModalForm,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import type { MenuProps, UploadProps } from 'antd';
import { Menu } from 'antd';
import uploadSvg from '@/assets/images/table-header/upload.svg'
import downloadSvg from '@/assets/images/table-header/download.svg'
import saveSvg from '@/assets/images/table-header/save.svg'
import restSvg from '@/assets/images/table-header/reset.svg'
import editSvg from '@/assets/images/table-header/edit.svg'
import setSvg from '@/assets/images/set.svg'
import { getToken } from "@/utils/account";
import { downloadSetupFile, getPatternGroupDetail, updatePatternGroup, validatePath } from "@/services/patternGroup/api";
import { createProjectGroup, getProjectDetail } from "@/services/project/api";
import { PlusOutlined } from "@ant-design/icons";
import { throttle } from 'lodash';

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

const GroupConfig: React.FC<any> = ({ projectId }) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const [dataSource, setDataSource] = useState<DataSourceType[]>(); // 源数据
  const [backupData, setBackupData] = useState<DataSourceType[]>(); // 用于存储重置时的数据
  const [isEditing, setIsEditing] = useState(false); //是否正在编辑
  const [isUpdateRowError, setIsUpdateRowError] = useState(false);
  const [groupList, setGroupList] = useState<any>([])
    // 用于动态切换enableTimingMerge
    const [switchState, setSwitchState] = useState<any>([]);
  const fetchGroupData = async (params: any) => {
    const resp = await getPatternGroupDetail(params)
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
  const fetchGroupList = async () => {
    const respProject = await getProjectDetail({ id: projectId })

    const { code: projectCode, message: m, data: dataProject } = respProject

    if (projectCode !== 0) {
      message.error(m)
      return
    }
    setGroupList(dataProject.groupList)
  }
  const fetchGroupListAndInitGroupData = async () => {
    const respProject = await getProjectDetail({ id: projectId })

    const { code: projectCode, message: m, data: dataProject } = respProject

    if (projectCode !== 0) {
      message.error(m)
      return
    }
    setGroupList(dataProject.groupList)

    fetchGroupData({ id: dataProject.groupList[0].key })
    setStateOpenKeys([`${dataProject.groupList[0].key}`])
    setSwitchState(dataProject.groupList.reduce((acc: any, group: any) => {
      acc[group.key] = group.enableTimingMerge; // 初始化状态
      return acc;
    }, {} as Record<string, boolean>)
  )
  }
  // 初始化左侧 groupList 和第一个group的信息
  useEffect(() => {
    fetchGroupListAndInitGroupData()
  }, [])
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
            // {
            //   required: true,
            //   message: 'Value is required',
            // },
            {
              validator: (_, value) => {
                if (record.entity.parameter === 'exclude_signals' && !/^[\x00-\xff\.\\\:]*$/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('请输入一个合法路径'));
                }
                if (record.entity.parameter === 'optimize_drive_edges') {
                  if (parseInt(value) !== 0 && parseInt(value) !== 1) {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字范围在0 或者 1'));
                  }
                }
                if (record.entity.parameter === 'optimize_receive_edges') {
                  if (parseInt(value) !== 0 && parseInt(value) !== 1) {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字范围在0 或者 1'));
                  }
                }
                if (record.entity.parameter === 'pattern_comments') {
                  if (value !== 'on' && value !== 'off') {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('on or off'));
                  }
                }
                if (record.entity.parameter === 'repeat_break') {
                  if (!/^[1-9]\d*$/.test(value)) {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('正整数'));
                  }
                }
                if (record.entity.parameter === 'equation_based_timing') {
                  if (parseInt(value) !== 0 && parseInt(value) !== 1) {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字范围在0 或者 1'));
                  }
                }
                if (record.entity.parameter === 'add_scale_spec') {
                  if (parseInt(value) !== 0 && parseInt(value) !== 1) {
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字范围在0 或者 1'));
                  }
                }
                if (record.entity.parameter === 'label_suffix') {
                  if(value==='' || value===null){
                    setIsUpdateRowError(false)
                    return Promise.resolve();
                  }
                  if(!/^(?!_)\w+$/.test(value)){
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('数字、英文字母或_组成的字符串,且_不可开头'));
                  }
                 
                }
                if (record.entity.parameter === 'port_config') {
                  if(value==='' || value===null){
                    setIsUpdateRowError(false)
                    return Promise.resolve();
                  }
                  if(!/^[\x00-\xff\.\\\,\:]+$/.test(value)){
                    setIsUpdateRowError(true)
                    return Promise.reject(new Error('请输入一个合法路径'));
                  }

                 
                }
                if (record.entity.parameter === 'rename_signals' && !/^[\x00-\xff\.\\\:]*$/.test(value)) {
                  setIsUpdateRowError(true)
                  return Promise.reject(new Error('请输入一个合法路径'));
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
  const handleSave = async () => {
    if (isUpdateRowError) {
      message.error('把错误更正')
      return
    }
    const resoreDataSource = restoreConfig(dataSource as DataSourceType[])
    console.log(resoreDataSource); // 保存数据的逻辑
    if(resoreDataSource.exclude_signals){
      const {code,message: errorMessage, data} = await validatePath({excludeSignalsPath: resoreDataSource.exclude_signals})
      if(code!==0){
           message.error(errorMessage)
           return
      }
      if(!data){
        message.error('excludeSignalsPath在系统中不存在，请输入正确的路径')
        return
      }
    }
    if(resoreDataSource.port_config){
      
      const {code,message: errorMessage, data} = await validatePath({pinConfigPath: resoreDataSource.port_config})
      if(code!==0){
        message.error(errorMessage)
        return
      }
      if(!data){
        message.error('port_config在系统中不存在，请输入正确的路径')
        return
      }
    }
    if(resoreDataSource.rename_signals){
      const {code,message: errorMessage, data} = await validatePath({portConfigPath: resoreDataSource.rename_signals})
      if(code!==0){
        message.error(errorMessage)
        return
      }
      if(!data){
        message.error('rename_signals在系统中不存在，请输入正确的路径')
        return
      }
    }

    setEditableRowKeys([]); // 禁用所有行的编辑模式
    setIsEditing(false);

    const currentOpenKey = stateOpenKeys[0]
    console.log('currentOpenKey', currentOpenKey);
    const respGroup = await updatePatternGroup({ id: currentOpenKey }, { setupConfig: resoreDataSource })
    const { codeGroup } = respGroup

    if (codeGroup !== 0) {
      return
    }
    fetchGroupData({ id: currentOpenKey })

  }

  const handleEdit = () => {
    if (dataSource) {
      setBackupData([...dataSource]); // 备份当前数据
      console.log('222', dataSource);
      setEditableRowKeys(dataSource.map((item) => item.id)); // 启用所有行的编辑模式
      setIsEditing(true);

    }

  }

  const handleReset = () => {
    if (backupData) {
      setDataSource([...backupData]); // 恢复备份的数据
      console.log('1111', dataSource);

      setEditableRowKeys([]); // 退出编辑模式
      setIsEditing(false);
    }

  }

  const handleDownload = async () => {
    try {
      const response = await downloadSetupFile({})
      let objectUrl = URL.createObjectURL(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); // 创建URL
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'core_setup_template.xlsx'; // 自定义文件名
      link.click(); // 下载文件
      URL.revokeObjectURL(objectUrl); // 释放内存
      message.success('下载完成')
    } catch (error) {
      message.error('文件下载失败:');
    } finally {
    }

  }
  const throttledDownload = throttle(handleDownload, 10000); // 1000ms = 1秒节流
  //menu-----------------------------------------------------------------------

  type MenuItem = Required<MenuProps>['items'][number];

  // 后端返回的数据
  // const groupList = [
  //   { key: '1', groupName: 'G1' },
  //   { key: '2', groupName: 'G2' },
  //   { key: '3', groupName: 'Group G3' },
  // ];



  const handleSwitchChange = async (checked: boolean, groupKey: string) => {
    const { code, message: errorMessage } = await updatePatternGroup({ id: groupKey }, { enableTimingMerge: checked })
    if (code !== 0) {
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
  const createMenuItems = (groups: { key: string; groupName: string, enableTimingMerge: boolean }[]): MenuItem[] => {
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

              <Switch size="small" checked={switchState[group.key]} onChange={(checked) => handleSwitchChange(checked, group.key)} style={{ marginLeft: 10 }} />
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
  const [stateOpenKeys, setStateOpenKeys] = useState(['']);

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {


    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    console.log('currentOpenKey', currentOpenKey);
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
      fetchGroupData({ id: currentOpenKey })


    } else {
      // close
      setStateOpenKeys(openKeys);
      console.log('closeKeys', openKeys);
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
            fetchGroupData({ id: stateOpenKeys[0] })
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
  const [form] = Form.useForm<{ name: string; company: string }>();

  return (
    <div className={styles.group_config}>
      <div className={styles.left}>
        <Card title={<>
          <div>
          <span style={{marginRight:100}}>Group List</span> 
            <ModalForm<{
              name: string;
              company: string;
            }>
              title="group"
              trigger={
                <Button type="primary" style={{backgroundColor:'#869fce'}}>
                  <PlusOutlined />
                 new group
                </Button>
              }
              width={400}
              form={form}
              autoFocusFirstInput
              modalProps={{
                destroyOnClose: true,
                onCancel: () => console.log('run'),
              }}
              submitTimeout={2000}
              onFinish={async (values: any) => {
                console.log(values.groupName);
                const {code, message: errorMessage} =  await createProjectGroup({projectId,groupName: values.groupName})
                if(code!==0){
                  message.error(errorMessage)
                  return
                }
                fetchGroupListAndInitGroupData()
                message.success('添加组成功');
                return true;
              }}
            >
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="groupName"
                  label="新的组名字"
                  tooltip="最长为 24 位"
                  placeholder="请输入名称"
                  required
                  rules={[
                    {
                      required: true,
                      message: '组名字不能为空', // Custom error message for empty input
                    },
                    {
                      min: 1,
                      message: '组名字必须至少包含 1 个字符', // Ensure length is at least 1 character
                    },
                    {
                      max: 24,
                      message: '组名字不能超过 24 个字符', // Ensure length doesn't exceed 24 characters
                    }
                  ]}
                />
              </ProForm.Group>

            </ModalForm>

          </div>
          
          </>}>
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
                <Tooltip title='上传setup文件,支持拖拽'>
                  <img src={uploadSvg} onClick={() => {
                    // handleUpload()
                  }} />
                  </Tooltip>
                </Dragger>
              </div>
              ,
              <Tooltip title='下载模板文件'>
              <img src={downloadSvg} onClick={()=>
                throttledDownload()
              } />
              </Tooltip>,
              <Tooltip title='编辑配置'>

              <img src={editSvg} onClick={() => {
                handleEdit()
              }} />
              </Tooltip>,
              isEditing &&(<>
              <Tooltip title='保存'>
              <img src={saveSvg} onClick={() => {
                handleSave()
              }} />
               </Tooltip>
               <Tooltip title='撤销'>
              <img src={restSvg} onClick={() => {
                handleReset()
              }} />
              </Tooltip>
              </>)
             
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



