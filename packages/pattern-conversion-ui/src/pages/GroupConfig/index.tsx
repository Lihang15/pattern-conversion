import { ProTable } from "@ant-design/pro-components";
import { Card, Input, Switch, Tabs, TabsProps } from "antd";
import React, { useState } from 'react';
import styles from './style.less';
import type { ProColumns } from '@ant-design/pro-components';
import {
  EditableProTable,
  ProCard,
  ProFormField,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  created_at?: number;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = new Array(20).fill(1).map((_, index) => {
  return {
    id: (Date.now() + index).toString(),
    title: `活动名称${index}`,
    decs: '这个活动真好玩',
    state: 'open',
    created_at: 1590486176000,
  };
});

const GroupConfig = () => {
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
      title: 'Parameter',
      dataIndex: 'title',
      width: '70%',
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
      title: 'Value',
      dataIndex: 'decs',
    },
  ];

  //menu-----------------------------------------------------------------------
  
type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '1',
    icon: <SettingOutlined />,
    label: 'G1',
    children: [
      { key: '21', label: (<div>
        
        Timing Merge<Switch size="small" defaultChecked style={{marginLeft:10}}/>
        </div>) },
    ],
  },
  {
    key: '2',
    icon: <SettingOutlined />,
    label: 'G2',
    children: [
      { key: '21', label: (
        <div>
        
        Timing Merge<Switch size="small" defaultChecked style={{marginLeft:10}} />
        </div>
    ) },
    ],
  },
  {
    key: '3',
    icon: <SettingOutlined />,
    label: 'Group G3',
    children: [
      { key: '31', label: (<div>
        
        Timing Merge<Switch size="small" defaultChecked style={{marginLeft:10}}/>
        </div>) },
    ],
  },
];

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
  const [stateOpenKeys, setStateOpenKeys] = useState(['2', '23']);

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
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
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };


  return (
    <div className={styles.group_config}>
    
        <div className={styles.left}>
          <Card title='Group Name'>
          <Menu
              mode="inline"
              defaultSelectedKeys={['231']}
              openKeys={stateOpenKeys}
              onOpenChange={onOpenChange}
              style={{ width: 256 }}
              items={items}
            />
          </Card>
        </div>
    
      <div className={styles.right}>
        <EditableProTable<DataSourceType>
          bordered = {true}
          headerTitle = 'Core Parameter Config'
          columns={columns}
          rowKey="id"
          scroll={{
            x: 960,
          }}
          value={dataSource}
          onChange={setDataSource}
          recordCreatorProps={false
          }
          toolBarRender={() => {
            return [
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
      </div>

  </div>
  );
};

export default GroupConfig;



