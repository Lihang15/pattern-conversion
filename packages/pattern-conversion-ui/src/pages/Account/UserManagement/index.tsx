import services from '@/services/demo';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { addUser, getUserList } from '@/services/account/api';

const { deleteUser, modifyUser } =
  services.UserController;



/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: any) => {
  const hide = message.loading('正在配置');
  try {
    await modifyUser(
      {
        userId: fields.id || '',
      },
      {
        name: fields.name || '',
        nickName: fields.nickName || '',
        email: fields.email || '',
      },
    );
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UserInfo[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await deleteUser({
      userId: selectedRows.find((row) => row.id)?.id || '',
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const UserMangement: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<API.UserInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserInfo[]>([]);
     // 表格列和数据

  
      //项目列表数据
  const [tableData, setTableData] = useState<API.UserInfo[]>();

  const columns: ProColumns<API.UserInfo>[] = [
    {
      title: 'username',
      dataIndex: 'username',
      tooltip: 'Username',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'The username is required',
          },
          {
            max: 30,
            message: 'Username cannot exceed 30 characters!',
          },
        ],
      },
    },
    {
      title: 'email',
      dataIndex: 'email',
      tooltip: 'Email',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'The email is required',
          },
          {
            max: 30,
            message: 'Email cannot exceed 30 characters!',
          },
        {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: 'Email is invalid'
        }
        ],
      },
    },
    {
        title: 'password',
        dataIndex: 'password',
        tooltip: 'Password',
        formItemProps: {
          rules: [
            {
              required: true,
              message: 'The password is required',
            },
            {
              max: 30,
              message: 'Password cannot exceed 30 characters!',
            },
          ],
        },
      },

      {
        title: 'roles',
        dataIndex: 'roles',
        tooltip: 'role',
        render: (_, record) => (
          <>
            {record.roles ? record.roles.toString() : ''}
          </>
        ),
        valueType : 'select',
        fieldProps: {
            mode: 'multiple'
        },
        request: async()=>{
           return [{label: 'Developer',value:'Developer'},{label: 'Admin',value:'Admin'}]
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: 'Roles is required',
            },
          ],
          

        },
      },
    
   
    {
      title: 'operation',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            Modifying User Information
          </a>
        
        
        </>
      ),
    },
  ];
  const fetch = async()=>{
    const {code, data} = await getUserList({})
    if(code!==0){
      message.error('获取用户列表失败')
    }
    setTableData(data)
 }
  useEffect(()=>{
    fetch()
  },[])
  /**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UserInfo) => {
  const hide = message.loading('adding');
  try {
    await addUser({ ...fields });
    fetch()
    hide();
    message.success('Add successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Add failed please try again！');
    return false;
  }
};

  return (
    <PageContainer
      header={{
        title: '',
      }}
    >
      
      <ProTable<API.UserInfo>
        headerTitle="User List"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => handleModalVisible(true)}
          >
           Add a new user
          </Button>,
        ]}
        // request={async (params, sorter, filter) => {
        //   const { data, success } = await queryUserList({
        //     ...params,
        //     // FIXME: remove @ts-ignore
        //     // @ts-ignore
        //     sorter,
        //     filter,
        //   });
        //   return {
        //     data: data?.list || [],
        //     success,
        //   };
        // }}
        dataSource={tableData}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Selected{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              item&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              // await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            Batch deletion
          </Button>
          {/* <Button type="primary">批量审批</Button> */}
        </FooterToolbar>
      )}
      <CreateForm
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      >
        <ProTable<API.UserInfo, API.UserInfo>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="id"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value: any) => {
            const success = await handleUpdate(value);
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
      ) : null}
{/* 
      <Drawer
        width={600}
        open={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.username && (
          <ProDescriptions<API.UserInfo>
            column={2}
            title={row?.username}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.username,
            }}
            columns={columns}
          />
        )}
      </Drawer> */}
    </PageContainer>
  );
};

export default UserMangement;
