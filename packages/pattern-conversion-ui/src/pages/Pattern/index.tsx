import React, { useState } from 'react';
import styles from './style.less'
import { EditableProTable, ProCard, ProColumns, ProDescriptions, ProFormRadio, ProTable } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, ReloadOutlined, SearchOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Input, InputRef, MenuProps, Progress, Space, Spin, Table, TableColumnType, Tabs, TabsProps, Tag, Tooltip } from "antd";
import { ProgressProps, TableProps, message } from 'antd';
import { FC, useEffect, useRef } from "react";
import { createProject, getProjectDetail, patternList, projectList, projectProjectDashboard, startPatternConversion, updateProject } from '@/services/project/api';
import FloatingForm from "@/components/Form/FloatForm";
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import GroupConfig from '../GroupConfig';
import PinPortConfig from '../PinPortConfig';
import { useLocation, useParams, history } from '@umijs/max';
import Confetti from "react-confetti";

const Pattern = () => {

    // 左侧项目详情
    const [projectDetail, setProjectDetail] = useState<any>();
    // 下拉选择
    const [selectProjectKey, setSelectProjectKey] = useState<any>();


    //项目列表数据
    const [tableData, setTableData] = useState<DataType[]>();
    // 排序 projectName,asc|xxx,desc
    const [sorter, setSorter] = useState<string>()
    //分页
    const [pagination, setPagination] = useState<any>({current: 1,pageSize:10})
    // 查询参数
    const [params, setParams] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false); // 添加 loading 状态
  
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
       const {id} = useParams(); // 获取路径中的 `id`
      
       
       let useId = id
     
    useEffect(()=>{
   
      const fetchData = async ()=>{

        if(id===":id"){
          const resp = await getProjectDetail({})
          const { code, data } = resp
       
          if (code !== 0) {
            return
          }
          useId = data.projectInfo.id
          await updateProject({id: useId},{isCurrent: true}) 

        }
              
        const respProject =await getProjectDetail({id: useId})

        const { code: projectCode, data: dataProject } = respProject
 
        if (projectCode !== 0) {
          return
        }
        setProjectDetail(dataProject)
      }
      // 页内 切换不需要location
      fetchData()

    },[selectProjectKey])
    useEffect(() => {
      const fetchData = async () => {
        if(id===":id"){
          const resp = await getProjectDetail({})
  
          const { code, data } = resp
    
          if (code !== 0) {
            return
          }
          useId = data.projectInfo.id

        }
        const resp = await patternList({...params,projectId:useId ,current: pagination.current,pageSize: pagination.pageSize,sorter})
        const { code, data } = resp
        if (code !== 0) {
          return
        }

        const {pattern,total,current,pageSize} = data
        setTableData(pattern)
        setPagination((prev: any) => ({
          ...prev,
          total,
          current,
          pageSize,
        }));


      };

      fetchData();
    }, [params, sorter, pagination.current, pagination.pageSize,selectProjectKey]);
  
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
      // setPagination({current: pagination})
      setPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total
      })
      
      setSorter(processSorter(sorter))
  
    }

    const processSorter = (sorters: any) => {
      const sortParams = Array.isArray(sorters) ? sorters : [sorters]
      return sortParams.filter((s) => s.order).map((s) => `${s.columnKey},${s.order}`).join('|')
    }
  
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
  
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
  
    const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
    };
  
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
      onFilter: (value, record) =>
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
      },
  
      {
        title: 'Conversion Status',
        sorter: true,
      
        key: 'conversionStatus',
        ...getColumnSearchProps('conversionStatus'),
        hideInSearch: true,
        // width: '12%',
        dataIndex: 'conversionStatus',
        // render: (text) => <a>{text === true ? '是' : '否'}</a>,
      },
  
      {
        sorter: true,
        title: 'Update Time',
        dataIndex: 'updatedAt',
        // width: '10%',
        key: 'updatedAt',
        ...getColumnSearchProps('updatedAt'),
        hideInSearch: true,
      },

    ];

  // const onChangePattrenAuto = (checked: boolean) => {
  //   console.log(`switch to ${checked}`);
  // };
  // const onChangeRefreshAuto = (checked: boolean) => {
  //   console.log(`switch to ${checked}`);
  // };
  type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [runButtonDisabled, setRunButtonDisabled] = useState<boolean>(true);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  useEffect(()=>{
     if(selectedRowKeys.length>0){
      setRunButtonDisabled(false)
     }else{
      setRunButtonDisabled(true)
     }
  },[selectedRowKeys])

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

    //进度条
    const [isProgressing,setIsProgressing] = useState<boolean>(false)
    const[processPercent, setProcessPercent] = useState<number>(1)
    const[precent, setPrecent] = useState<string>('0')
    const twoColors: ProgressProps['strokeColor'] = {
      '0%': '#b795e4',
      '100%': ' #b795e4',
    };

    // 烟花特效控制
    const [showEffect, setShowEffect] = useState(false);

    const handleProcess = (value: any)=>{
      setIsProgressing(true)
      const eventSource = new EventSource(`http://10.5.33.192:7001/api/project/start_pattern_conversion?`,{ withCredentials: true });
      eventSource.onmessage = (event) => {
        // console.log('Received event:', event); // 查看整个事件对象
        // console.log('Received event data:', event.data); // 查看事件的原始数据
        try {
          const logMessage = event.data;
          const { process, precent } = JSON.parse(logMessage); // 确保 JSON 数据格式正确
          setProcessPercent(process)
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
        setProcessPercent(1)
        setPrecent('0')
       
      };
  
  
    }

    const handleRunClick = ()=>{
      setSelectedRowKeys([]);
      handleProcess('')
    }

    const items: TabsProps['items'] = [
      {
        key: '1',
        label: 'Pin/Port Config',
        children: (
          <PinPortConfig/>
        ),
      },
      {
        key: '2',
        label: 'Group Config',
        children: <GroupConfig groupList={projectDetail?.groupNames}/>,
      },
      {
        key: '3',
        label: 'Pattern',
        children: (
          <ProTable<DataType> columns={columns}
          rowKey = 'id'
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
        )
      }
    ];

    const onTabsChange = (key: string) => {
      console.log(key);
    };

    // 按钮操区
    // 切换menu
    
  // 项目下拉选项
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
const handleAddFormSubmit = (values) => {
  console.log('表单提交数据:', values);
  const fetchData = async () => {
    const resp = await createProject(values)
    const { code, message: m, data } = resp
    if(code===0){
      setIsAddProject(false); // 提交成功后关闭浮层
      setSelectProjectKey('add')
    }else{
      message.error(m);
    }   
  };
  fetchData();
 
};
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
                  <Dropdown menu={ menu } className={styles.drop_menu}>
                  <Tooltip title="切换项目" color = "#87d068">
                      <DownOutlined />
                      </Tooltip>
                </Dropdown>
                   <ReloadOutlined />

                   <Tooltip title="添加项目" color = "#87d068"> 
                   
                    <ZoomInOutlined onClick={(e) => setIsAddProject(true) }/>
                    </Tooltip>
                    
                     <DeleteOutlined /></div> </div>
               </div>
            </ProCard>
          

    
          
        </div>

        <div className={styles.right}>
        <Tabs defaultActiveKey="3" items={items} onChange={onTabsChange} />;
        
                
        </div>

        {
      isProgressing && (

        <div className={styles.process_area}>
          
          <div className={styles.process}>
            <p>
              <Spin tip="Loading" size="large">
                
              </Spin>
            正在转换中已完成{precent}
            </p>
       
            <Progress percent={processPercent} strokeColor={twoColors} size={[200, 10]}/>
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
        {showEffect && <Confetti numberOfPieces={500} recycle={false} width={1920}/>} 


    </div>

  );
};

export default Pattern;
