import React, { useState } from 'react';
import styles from './style.less'
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, ReloadOutlined, SearchOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Input, InputRef, Modal, Progress, Select, Space, Spin, Table, TableColumnType, Tabs, TabsProps, Tag, Tooltip } from "antd";
import { ProgressProps, TableProps, message } from 'antd';
import { useEffect, useRef } from "react";
import { createProject, getProjectDetail, patternList, refreshProject, updateProject } from '@/services/project/api';
import FloatingForm from "@/components/Form/FloatForm";
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import GroupConfig from '../GroupConfig';
import PinPortConfig from '../PinPortConfig';
import { useParams, history } from '@umijs/max';
import Confetti from "react-confetti";
import ErrorLog from '@/components/ErrorLog';
import Loading from '@/components/Loading';
import { switchPatternGroup } from '@/services/patternGroup/api';


const Pattern = () => {

  //-------------------处理左侧项目详情-------------------------------//
  // 左侧项目详情
  const [projectDetail, setProjectDetail] = useState<any>();
  // 下拉选择的key
  const [selectProjectKey, setSelectProjectKey] = useState<any>();
  const { id } = useParams(); // 获取路径中的 `id`
  let useId = id
  const [pageloading, setPageLoading] = useState(true); // 添加 loading 状态
  // 初始化项目数据
  useEffect(() => {

    const fetchData = async () => {

      if (id === ":id") {
        const resp = await getProjectDetail({})
        const { code, message: errorMessage,data } = resp

        if (code !== 0) {
          message.error(errorMessage)
          return
        }
        useId = data.projectInfo.id
        await updateProject({ id: useId }, { isCurrent: true })

      }

      const respProject = await getProjectDetail({ id: useId })

      const { code: projectCode, message: m, data: dataProject } = respProject

      if (projectCode !== 0) {
        message.error(m)
        return
      }
      setProjectDetail(dataProject)
    }
    fetchData()
   
  setPageLoading(false)
  }, [selectProjectKey])
  // -------------------打开刷新的对话框------------------------------//
  const [openRefresh, setOpenRefresh] = useState(false);

  const showRefreshModal = async () => {
    setOpenRefresh(true);
  };

  const refreshModalConfirm = async() => {
    const {code, message: errorMessage} = 
    await refreshProject({projectName: projectDetail.projectInfo.projectName,inputPath: projectDetail.projectInfo.inputPath})
    if(code!==0){
      message.error(errorMessage)
      return
    }
    fetchData();
    message.success('刷新成功')
    setOpenRefresh(false);
  };
  const hideRefreshModal = async ()=>{
    setOpenRefresh(false);
  }

  //------------------------编辑pattern-group-----------------------//
  const [openGroupSelect, setOpenGroupSelect] = useState(false); // 控制 Modal 的显示
  const [form] = Form.useForm(); // 使用 Form 实例
  const [selectPatternId, setSelectPatternId] = useState(); // 控制 Modal 的显示
  // 打开 Modal
  const showGroupSelectModal = (patternId: any) => {
    setSelectPatternId(patternId)
    setOpenGroupSelect(true);
  };

  // 关闭 Modal
  const hideGroupSelectModal = () => {
    setOpenGroupSelect(false);
  };

  // 确认按钮点击事件
  const groupSelectModalConfirm = async () => {
    try {
      // 提交表单
      const values = await form.validateFields();
      
      // 执行确认操作，例如提交到后端
      console.log('选择的资源:', values.selectedGroup);
      
      const {code, message: errorMessage} = await switchPatternGroup({projectId: projectDetail.projectInfo.id,groupId: values.selectedGroup,patternId:selectPatternId})
      if(code!==0){
        message.error(errorMessage)
        return
      }
      // 提交成功后做相应的操作
      message.success('group已成功修改');
      fetchData()
      // 关闭 Modal
      hideGroupSelectModal();
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };


  //-------------------处理pattern列表相关-------------------------------//
  //pattern列表数据
  const [tableData, setTableData] = useState<DataType[]>();
  // 排序 projectName,asc|xxx,desc
  const [sorter, setSorter] = useState<string>()
  //分页
  const [pagination, setPagination] = useState<any>({ current: 1, pageSize: 10 })
  // 查询参数
  const [params, setParams] = useState<{ [key: string]: string }>({});
 

  // 表格列和数据
  interface DataType {
    id: string,
    fileName: string,
    status: string;
    conversionStatus: string;
    format: string,
    updatedAt: string;
  }
  type DataIndex = keyof DataType;

  const fetchData = async () => {
    if (id === ":id") {
      const resp = await getProjectDetail({})

      const { code, message: errorMessage,data } = resp

      if (code !== 0) {
        message.error(errorMessage)
        return
      }
      useId = data.projectInfo.id
     
    }
    const resp = await patternList({ ...params, projectId: useId, current: pagination.current, pageSize: pagination.pageSize, sorter })
    const { code, data } = resp
    if (code !== 0) {
      return
    }


    const { pattern, total, current, pageSize } = data
    setTableData(pattern)
    setPagination((prev: any) => ({
      ...prev,
      total,
      current,
      pageSize,
    }));
   

  };

  // 初始化pattern列表数据
  useEffect(() => {
    
    fetchData();
  }, [params, sorter, pagination.current, pagination.pageSize, selectProjectKey]);


  // 处理表格变化
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // setPagination({current: pagination})
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total
    })

    setSorter(processSorter(sorter))

  }

  // 格式化排序参数
  const processSorter = (sorters: any) => {
    const sortParams = Array.isArray(sorters) ? sorters : [sorters]
    return sortParams.filter((s) => s.order).map((s) => `${s.columnKey},${s.order}`).join('|')
  }

  // 查询列相关
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  // 处理查询
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    console.log('xxxxxxxxxxxxx', selectedKeys, dataIndex);

    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);


    // 更新 params，存储列名和输入值
    setParams((prevParams) => ({
      ...prevParams,
      [dataIndex]: selectedKeys[0], // 将列名和输入值存储到 params 中
    }));
  };

  //处理重设
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };
  // 在表格列上动态的加查询框
  const getColumnSearchProps = (dataIndex: any): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          {/* <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText((selectedKeys as string[])[0]);
                setSearchedColumn(dataIndex);
              }}
            >
              Filter
            </Button> */}
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record: any) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  // pattern列
  const columns: any = [
    {
      sorter: false,
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      ...getColumnSearchProps('fileName'),
      // width: '10%',
      // render: (text) => <a>{text}</a>,
      // hideInSearch: true,
    },
    {
      sorter: true,
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      ...getColumnSearchProps('format'),
      // width: '15%',
      // render: (text) => <a>{text}</a>,
      // hideInSearch: true,
    },

    {
      sorter: true,
      title: 'Pattern Group',
      key: 'groupName',
      ...getColumnSearchProps('groupName'),
      hideInSearch: true,
      // width: '12%',
      dataIndex: 'groupName',
      // render: (text) => <a>{text === true ? '是' : '否'}</a>,
    },

    {
      title: 'File Status',
      sorter: true,
      key: 'status',
      ...getColumnSearchProps('status'),
      hideInSearch: true,
      // width: '12%',
      dataIndex: 'status',
      // render: (text) => <a>{text === true ? '是' : '否'}</a>,
      render: (text: any) => <Tag color='success'>{text}</Tag>
    },

    {
      title: 'Conversion Status',
      sorter: true,

      key: 'conversionStatus',
      ...getColumnSearchProps('conversionStatus'),
      hideInSearch: true,
      // width: '12%',
      dataIndex: 'conversionStatus',
      render: (text: any) => text !== 'Failed' ? <><Tag color='purple'>{text}</Tag></> : <><Tag color='error'>{text}</Tag></>,
    },

    {
      sorter: true,
      title: 'Date',
      dataIndex: 'updatedAt',
      // width: '10%',
      key: 'updatedAt',
      ...getColumnSearchProps('updatedAt'),
      hideInSearch: true,
    },

    {
      title: 'Operation',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: any) => (
        <>
          <Space size="middle">
            <Tag style={{ cursor: 'pointer' }} onClick={()=>showGroupSelectModal(record.id) } color="cyan">edit group</Tag>
            {record.errorLog && (<Tag onClick={() => { toggleErrorLogModal(record.errorLog) }} color="#f50">error log</Tag>)}

          </Space>


        </>
      ),
    },

  ];

  // 表格多选相关的操作
  type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [runButtonDisabled, setRunButtonDisabled] = useState<boolean>(true);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  // 表头run按钮的 disable状态
  useEffect(() => {
    if (selectedRowKeys.length > 0) {
      setRunButtonDisabled(false)
    } else {
      setRunButtonDisabled(true)
    }
  }, [selectedRowKeys])

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };


  //-------------------处理错误log的展示-------------------------------//
  const [isShowErrorLog, setIsShowErrorLog] = useState<boolean>(false)
  const [errorLogs, setErrorLogs] = useState<string>()
  const toggleErrorLogModal = (logs: string) => {
    setIsShowErrorLog(true)
    setErrorLogs(logs)
  }



  //-------------------处理进度条-------------------------------//
  const [isProgressing, setIsProgressing] = useState<boolean>(false)
  const [progressPercent, setProgressPercent] = useState<number>(1)
  const [precent, setPrecent] = useState<string>('0')
  const twoColors: ProgressProps['strokeColor'] = {
    '0%': '#b795e4',
    '100%': ' #b795e4',
  };
  // 执行成功关闭进度后的烟花特效控制
  const [showEffect, setShowEffect] = useState(false);

  // 点击run按钮后 处理进度条ui
  const handleProgress = (value: any) => {
    setIsProgressing(true)
    const eventSource = new EventSource(`http://10.5.33.192:7001/api/project/start_pattern_conversion?`, { withCredentials: true });
    eventSource.onmessage = (event) => {
      // console.log('Received event:', event); // 查看整个事件对象
      // console.log('Received event data:', event.data); // 查看事件的原始数据
      try {
        const logMessage = event.data;
        const { progress, precent } = JSON.parse(logMessage); // 确保 JSON 数据格式正确
        setProgressPercent(progress)
        setPrecent(precent)

      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error receiving logs:', error);
      console.log('EventSource readyState:', eventSource.readyState);
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 5000); // 5秒后关闭特效
      eventSource.close();
      setIsProgressing(false)
      setProgressPercent(1)
      setPrecent('0')

    };


  }

  const handleRunClick = () => {
    setSelectedRowKeys([]);
    handleProgress('')
  }

  //-------------------处理pattern的3个tab标签-------------------------------//
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Pin/Port Config',
      children: (
        <PinPortConfig />
      ),
    },
    {
      key: '2',
      label: 'Group Config',
      children: <GroupConfig groupList={projectDetail?.groupNames} projectId={projectDetail?.projectInfo?.id} />,
    },
    {
      key: '3',
      label: 'Pattern',
      children: (
        <> <ProTable<DataType> columns={columns}
          rowKey='id'
          toolBarRender={() => [

            <Button type='primary' disabled={runButtonDisabled} onClick={handleRunClick}>run</Button>
          ]}
          rowSelection={rowSelection}
          headerTitle="Patten List"
          dataSource={tableData}
          loading={false}
          onChange={handleTableChange}
          search={false}
          pagination={{ ...pagination, pageSizeOptions: [10, 20, 30], showSizeChanger: true }} />
          {isShowErrorLog && <ErrorLog logs={errorLogs} onClose={toggleErrorLogModal} />}
        </>
      )
    }
  ];

  const onTabsChange = (key: string) => {
    console.log(key);
  };

  //-------------------处理左侧项目的按钮操作区，-------------------------------//

  // 切换menu，项目下拉选项
  const handleMenuClick = ({ key }: any) => {
    // const fetchData = async () => {
    //   await updateProject({id: key},{isCurrent: true})
    // }
    // fetchData()
    setSelectProjectKey(key)
    history.push(`/project/${key}/pattern`)
  };

  const menu = {
    items: projectDetail?.projectDropdownMenu.map((item: any) => ({
      ...item,
      onClick: handleMenuClick,
    })),
  };
  // add项目
  const [isAddProject, setIsAddProject] = useState<any>(false)
  const handleAddFormSubmit = (values: any) => {
    console.log('表单提交数据:', values);
    const fetchData = async () => {
      // 转义路径中的反斜杠
    const escapedValues = {
      ...values,
      inputPath: values.inputPath.replace(/\\/g, '\\\\'),
      outputPath: values.outputPath.replace(/\\/g, '\\\\'),
    };
      const resp = await createProject(escapedValues)
      const { code, message: m, data } = resp
      history.push(`/project/${data.id}/pattern`)
      if (code === 0) {
        setIsAddProject(false); // 提交成功后关闭浮层
        setSelectProjectKey('add')
      } else {
        message.error(m);
      }
    };
    fetchData();

  };

  if(pageloading){
    return <Loading />
  }
  return (
    <div className={styles.container}>


      <div className={styles.left}>

        <ProCard className={styles.card}>
          <div className={styles.project}>
            <span className={styles.key}>Project Name</span>
            <div className={styles.value}>{projectDetail?.projectInfo?.projectName}</div>
          </div>

          <div className={styles.project}>
            <span className={styles.key}>Input Path</span>
            <div className={styles.value}>{projectDetail?.projectInfo.inputPath}</div>
          </div>

          <div className={styles.project}>
            <span className={styles.key}>Output Path</span>
            <div className={styles.value}>{projectDetail?.projectInfo.outputPath}</div>
          </div>

          {/* <div className={styles.auto}>
                 
                  <div className={styles.key}><span>Automatic Pattern Conversion</span>  <Switch defaultChecked onChange={onChangePattrenAuto} /></div>
               </div>

               <div className={styles.auto}>
                  
                  <div className={styles.key}><span>Automatic Refresh Resources</span><Switch defaultChecked onChange={onChangeRefreshAuto} /></div>
               </div> */}

          <div className={styles.operating}>
            <span className={styles.key}>Operating Area</span>
            <div className={styles.value}> <div className={styles.svg}>
              <Dropdown menu={menu} className={styles.drop_menu}>
                <Tooltip title="切换项目" color="#87d068">
                  <DownOutlined />
                </Tooltip>
              </Dropdown>

              <Tooltip title="刷新项目" color="#87d068">
                <ReloadOutlined onClick={()=>{showRefreshModal()}}/>
              </Tooltip>

              <Tooltip title="添加项目" color="#87d068">
                <ZoomInOutlined onClick={(e) => setIsAddProject(true)} />
              </Tooltip>

              <DeleteOutlined /></div> </div>
          </div>
        </ProCard>




      </div>

      <div className={styles.right}>
        <Tabs defaultActiveKey="3" items={items} onChange={onTabsChange} />

      </div>

      {
        isProgressing && (

          <div className={styles.progress_area}>

            <div className={styles.progress}>
              <p>
                <Spin tip="Loading" size="large">

                </Spin>
                正在转换中已完成{precent}
              </p>

              <Progress percent={progressPercent} strokeColor={twoColors} size={[200, 10]} />
            </div>


          </div>
        )
      }
      {
        isAddProject && (
          <FloatingForm
            onClose={() => setIsAddProject(false)}
            onSubmit={handleAddFormSubmit}
          />
        )
      }

      {showEffect && <Confetti numberOfPieces={500} recycle={false} width={1920} />}

      <Modal
        title="Modal"
        open={openRefresh}
        onOk={refreshModalConfirm}
        onCancel={hideRefreshModal}
        okText="确认"
        cancelText="取消"
      >
        <p>你确定要刷新项目吗？</p>
        <p>确认后新的资源将被加载</p>
      </Modal>


      <Modal
        title="切换资源文件到指定的group"
        open={openGroupSelect}
        onOk={groupSelectModalConfirm}
        onCancel={hideGroupSelectModal}
        okText="确认"
        cancelText="取消"
      >
        <p>你确定要选择这个group吗？</p>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            selectedGroup: undefined, // 默认值
          }}
        >
          <Form.Item
            name="selectedGroup"
            label="选择group"
            rules={[{ required: true, message: '请选择一个group' }]}
          >
            <Select placeholder="请选择group" allowClear>
              {/* 动态渲染 Select.Option */}
              {projectDetail?.groupNames.map((option: any) => (
                <Select.Option key={option.key} value={option.key}>
                  {option.groupName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>


    </div>

  )
};

export default Pattern;
