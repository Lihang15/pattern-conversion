import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, InputRef, Space, TableColumnType, Tag, Tooltip } from "antd";
import { message } from 'antd';
import { FC, useEffect, useRef, useState } from "react";
import styles from './styles.less';
import { ProColumns, ProFormInstance, ProTable } from "@ant-design/pro-components";
import ColumnChart from '@/components/Charts/Column'
import PieChart from '@/components/Charts/Pie'
import { projectList, updateProject, projectDashboard } from '@/services/project/api';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { history } from "@umijs/max";
import Loading from "@/components/Loading";

const Poject: FC<any> = () => {

  //项目列表数据
  const [tableData, setTableData] = useState<any>();
  // 排序 projectName,asc|xxx,desc
  const [sorter, setSorter] = useState<string>()
  //分页
  const [pagination, setPagination] = useState<any>({current: 1,pageSize:5})
  // 查询参数
  const [params, setParams] = useState<{ [key: string]: string }>({});

  const [pageLoading, setPageLoading] = useState(true);


  const ref = useRef<ProFormInstance>()

    // 表格列和数据
    interface DataType {
      id: number,
      key: string,
      username: string,
      projectName: string;
      automaticPatternConversion: boolean;
      automaticRefreshResources: boolean,
      updatedAt: string;
    }
    type DataIndex = keyof DataType;
  // 初始化项目数据
  useEffect(() => {
    const fetchData = async () => {
      const resp = await projectList({...params,current: pagination.current,pageSize: pagination.pageSize,sorter})
      const { code, message: errorMessage,data } = resp
      if (code !== 0) {
        message.error(errorMessage)
        return
      }
      const {project,total,current,pageSize} = data
      setTableData(project)
      setPagination((prev: any) => ({
        ...prev,
        total,
        current,
        pageSize,
      }));
    };
    fetchData();
    setPageLoading(false)
  }, [params, sorter, pagination.current, pagination.pageSize]);

  const [dashboard, setDashboard] = useState<any>()
  // 初始化图表数据
  const fetchDashboard = async (id?: number) =>{
    const params = id?{id}:{}
    const {code ,message: errorMessage, data} = await projectDashboard(params)
    if(code!==0){
      message.error(errorMessage)
      return
    }
    setDashboard(data)
 }
  useEffect(()=>{
    fetchDashboard()
  },[])

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
  const handlePatternClick = (id: number):any =>{
    const fetch = async ()=>{
       await updateProject({id},{isCurrent: true}) 
       history.push(`/project/${id}/pattern`,{id})
    }  
   
   fetch()

  }
  const getColumnSearchProps = (dataIndex: any): ProColumns<DataType> => ({
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

  const handleProjectNameCilck = (record: any)=>{
    
    fetchDashboard(record.id)
    message.info('成功切换图表统计数据')
  }


  const columns: ProColumns[] = [
    {
      sorter: false,
      title: 'Account',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps('username'),
      width: '10%',
      // render: (text) => <a>{text}</a>,
      // hideInSearch: true,
    },
    {
      sorter: true,
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      ...getColumnSearchProps('projectName'),
      width: '15%',
      render: (text: any,record: any) => <> <Tooltip title="点击显示当前项目统计" color = "#87d068"><div onClick={()=>handleProjectNameCilck(record)}>{text}</div></Tooltip></>,
      // hideInSearch: true,
    },

    {
      sorter: true,
      title: 'Automatic Pattern Conversion',
      key: 'automaticPatternConversion',
      ...getColumnSearchProps('automaticPatternConversion'),
      hideInSearch: true,
      hidden:true,
      width: '12%',
      dataIndex: 'status',
      render: (text: any) => <a>{text === true ? '是' : '否'}</a>,
    },

    {
      title: 'Automatic Refresh Resources',
      sorter: true,
      hidden:true,
      key: 'automaticRefreshResources',
      ...getColumnSearchProps('automaticRefreshResources'),
      hideInSearch: true,
      width: '12%',
      dataIndex: 'status',
      render: (text: any) => <a>{text === true ? '是' : '否'}</a>,
    },
    {
      sorter: true,
      title: 'Update Time',
      dataIndex: 'updatedAt',
      width: '10%',
      key: 'updatedAt',
      ...getColumnSearchProps('updatedAt'),
      hideInSearch: true,
    },

    {
      title: 'Pattern',
      key: 'action',
      width: '10%',
      hideInSearch: true,
      render: (record: any) => (
        <Space size="middle">
          <Tag style={{ cursor: 'pointer' }} onClick={()=>{handlePatternClick(record.id)}} color="cyan">link to pattern</Tag>
          {/* <a >pattern link</a> */}
          {/* <a>Delete</a> */}
        </Space>
      ),
    },
  ];
  if(pageLoading){
    return <Loading />
  }

  return <div className={styles.container}>
    <Card>
      <div className={styles.content_area_top_table}>
        <ProTable<DataType> columns={columns} 
        formRef={ref}
        dataSource={tableData} 
        loading={pageLoading} 
        onChange={handleTableChange}
        rowKey={(record) => record.id}
          search={false}
         pagination={{ ...pagination, pageSizeOptions: [5, 10, 20], showSizeChanger: true }} />
      </div>
    </Card>

    <div className={styles.content_area_bottom_chart}>
      <Card>


        <div className={styles.chart_swap}>


          <div className={styles.chart_pie}>

            <p>{`[${dashboard?.projectName}]`} Project Pattern Status Format</p>

            <PieChart data={dashboard?.pieChartData}/>


          </div>




          <div className={styles.chart_colunm}>

            <p>{`[${dashboard?.projectName}]`} Project Pattern Type Format</p>
            <ColumnChart data = {dashboard?.columnChartData}/>
          </div>


        </div>
      </Card>
    </div>
  </div>
}

export default Poject