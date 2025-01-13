import React, { useState } from 'react';
import styles from './style.less'
import { EditableProTable, ProCard, ProDescriptions, ProFormRadio, ProTable } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, ReloadOutlined, SearchOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Input, InputRef, MenuProps, Progress, Space, Spin, Table, TableColumnType, Tag } from "antd";
import { ProgressProps, TableProps, message } from 'antd';
import { FC, useEffect, useRef } from "react";
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "../../components/Form/StepForm";
import ColumnChart from '@/components/Charts/Column'
import PieChart from '@/components/Charts/Pie'
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { createProject, patternList, projectList, projectProjectDashboard, startPatternConversion, updateProject } from '@/services/project/api';
import FloatingForm from "@/components/Form/FloatForm";
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

const Pattern = () => {

    //项目列表数据
    const [tableData, setTableData] = useState<DataType>();
    // 排序 projectName,asc|xxx,desc
    const [sorter, setSorter] = useState<string>()
    //分页
    const [pagination, setPagination] = useState<any>({current: 1,pageSize:10})
    // 查询参数
    const [params, setParams] = useState<{ [key: string]: string }>({});
  
      // 表格列和数据
      interface DataType {
        key: string,
        fileName: string,
        status: string;
        conversionStatus: string;
        format: boolean,
        updatedAt: string;
      }
      type DataIndex = keyof DataType;
  
    useEffect(() => {
      const fetchData = async () => {
        const resp = await patternList({...params,current: pagination.current,pageSize: pagination.pageSize,sorter})
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
        dataIndex: 'status',
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

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

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

  return (
    <div className={styles.container}>


          <div className={styles.left}>
                 
            <ProCard className={styles.card}>
               <div className={styles.project}>
                  <span className={styles.key}>Project Name</span>
                  <div className={styles.value}>Proejct_test</div>
               </div>

               <div className={styles.project}>
                  <span className={styles.key}>Input Path</span>
                  <div className={styles.value}>c:\\test\\xxx\\ate</div>
               </div>

               <div className={styles.project}>
                  <span className={styles.key}>Output Path</span>
                  <div className={styles.value}>c:\\output\\xxx\\ate</div>
               </div>

               {/* <div className={styles.auto}>
                 
                  <div className={styles.key}><span>Automatic Pattern Conversion</span>  <Switch defaultChecked onChange={onChangePattrenAuto} /></div>
               </div>

               <div className={styles.auto}>
                  
                  <div className={styles.key}><span>Automatic Refresh Resources</span><Switch defaultChecked onChange={onChangeRefreshAuto} /></div>
               </div> */}

               <div className={styles.operating}>
                  <span className={styles.key}>Operating Area</span>
                  <div className={styles.value}>  <DownOutlined />  <ReloadOutlined />  <ZoomInOutlined /> <DeleteOutlined /></div>
               </div>
            </ProCard>
          

    
          
        </div>

        <div className={styles.right}>
          <ProTable<DataType> columns={columns}
           toolBarRender={() => [
           
              <Button type='primary'>run</Button>
          ]} 
          rowSelection={rowSelection}
          headerTitle="Patten List"
          dataSource={tableData} 
          loading={false} 
          onChange={handleTableChange}
          rowKey={(record) => record.key}
            search={false}
          pagination={{ ...pagination, pageSizeOptions: [10, 20, 30], showSizeChanger: true }} />
                
        </div>
       

    </div>

  );
};

export default Pattern;
