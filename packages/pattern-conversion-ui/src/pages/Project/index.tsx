import { DownOutlined, ReloadOutlined, SearchOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Input, InputRef, MenuProps, Progress, Space, Spin, Table, TableColumnType, Tag } from "antd";
import { ProgressProps, TableProps, message } from 'antd';
import { FC, useEffect, useRef, useState } from "react";
import styles from './styles.less';
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "../../components/Form/StepForm";
import { ActionType, ProCard, ProTable } from "@ant-design/pro-components";
import ColumnChart from '@/components/Charts/Column'
import PieChart from '@/components/Charts/Pie'
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { createProject, projectList, projectProjectDashboard, startPatternConversion, updateProject } from '@/services/project/api';
import FloatingForm from "@/components/Form/FloatForm";
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

const Poject: FC<any> = () => {

  //项目列表数据
  const [tableData, setTableData] = useState<DataType>();
  // 排序 projectName,asc|xxx,desc
  const [sorter, setSorter] = useState<string>()
  //分页
  const [pagination, setPagination] = useState<any>({current: 1,pageSize:5})
  // 查询参数
  const [params, setParams] = useState<{ [key: string]: string }>({});

    // 表格列和数据
    interface DataType {
      key: string,
      username: string,
      projectName: string;
      automaticPatternConversion: boolean;
      automaticRefreshResources: boolean,
      updatedAt: string;
    }
    type DataIndex = keyof DataType;

  useEffect(() => {
    const fetchData = async () => {
      const resp = await projectList({...params,current: pagination.current,pageSize: pagination.pageSize,sorter})
      const { code, data } = resp
      if (code !== 0) {
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
  }, [params, sorter, pagination.current, pagination.pageSize]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // setPagination({current: pagination})
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total
    })
    
    setSorter(processSorter(sorter))

  }

  const handleTableSearch = (params: any) => {
    console.log(params);

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




  const columns: TableProps<DataType>['columns'] = [
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
      render: (text) => <a>{text}</a>,
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
      render: (text) => <a>{text === true ? '是' : '否'}</a>,
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
      render: (text) => <a>{text === true ? '是' : '否'}</a>,
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
      title: 'Resource',
      key: 'action',
      width: '10%',
      hideInSearch: true,
      render: (_, record) => (
        <Space size="middle">
          <a>pattern list</a>
          {/* <a>Delete</a> */}
        </Space>
      ),
    },
  ];

  return <div className={styles.container}>
    <Card>
      <div className={styles.content_area_top_table}>
        <ProTable<DataType> columns={columns} 
        dataSource={tableData} 
        loading={false} 
        onChange={handleTableChange}
        rowKey={(record) => record.key}
          search={false}
         pagination={{ ...pagination, pageSizeOptions: [5, 10, 20], showSizeChanger: true }} />
      </div>
    </Card>

    <div className={styles.content_area_bottom_chart}>
      <Card>


        <div className={styles.chart_swap}>


          <div className={styles.chart_pie}>

            <p>Projects Pattern Status Format</p>

            <PieChart />


          </div>




          <div className={styles.chart_colunm}>

            <p>Projects Pattern Type Format</p>
            <ColumnChart />
          </div>


        </div>
      </Card>
    </div>
  </div>
}

export default Poject