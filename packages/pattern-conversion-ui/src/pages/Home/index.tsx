import React, { useState } from 'react';
import { Table, Input } from 'antd';
import styles from './index.less'

const data = [
  { key: 1, name: 'John', age: 32, address: 'New York' },
  { key: 2, name: 'Jane', age: 42, address: 'London' },
  { key: 3, name: 'Jim', age: 32, address: 'Sydney' },
  { key: 4, name: 'Joe', age: 22, address: 'Paris' },
];

const MyTable = () => {
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({
    name: '',
    age: '',
    address: '',
  });

  // 动态更新filters
  const handleFilterChange = (columnKey, value) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);

    const filtered = data.filter((item) => {
      return (
        (!newFilters.name || item.name.toLowerCase().includes(newFilters.name.toLowerCase())) &&
        (!newFilters.age || item.age.toString().includes(newFilters.age.toString())) &&
        (!newFilters.address || item.address.toLowerCase().includes(newFilters.address.toLowerCase()))
      );
    });
    setFilteredData(filtered);
  };

  // 表头的列
  const columns = [
    {
      title: 'ATE Pin Name',
      dataIndex: 'name',
      render: (text, record, index) => {
        // 如果是第一行，则显示输入框
        return index === 0 ? (
          <Input
            style={{ border: 'none', boxShadow: 'none', padding: 0 }}
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            placeholder="查询"
          />
        ) : (
          text
        );
      },
      width: 300,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      render: (text, record, index) => {
        return index === 0 ? (
          <Input
          style={{ border: 'none', boxShadow: 'none', padding: 0 }}
            value={filters.age}
            onChange={(e) => handleFilterChange('age', e.target.value)}
            placeholder="查询"
          />
        ) : (
          text
        );
      },
      width: 150,
    },
    {
      title: 'Pattern Pin Name',
      dataIndex: 'pin',
      width: 300,
      render: (text: string, record: any,index: any) => (
        index===0? <Input
        // style={{ border: 'none', boxShadow: 'none', padding: 0 }}
          value={filters.age}
          onChange={(e) => handleFilterChange('age', e.target.value)}
          placeholder="查询"
          style={{ border: 'none', boxShadow: 'none', width: '100%', height: '100%',backgroundColor: 'none' }}
        />:
        <Input
          // value={q}
          onChange={(e) => handleInputChange(e.target.value, record, 'pin')}
          placeholder="请输入"
          style={{ border: 'none', boxShadow: 'none', width: '100%', height: '100%',backgroundColor: 'none' }}
        />
      ),
    },
    {
      title: 'Address',
      children: [
        {
          title: 'Company Address',
          dataIndex: 'companyAddress',
          key: 'companyAddress',
          width: 200,
        },
        {
          title: 'Company Name',
          dataIndex: 'companyName',
          key: 'companyName',
        },
      ],
      dataIndex: 'address',
      render: (text, record, index) => {
        return index === 0 ? (
          <Input
          style={{ border: 'none', boxShadow: 'none', width: '100%', height: '100%',backgroundColor: 'none' }}
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
            placeholder="查询"
          />
        ) : (
          text
        );
      },
      width: 100,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.table1}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          pagination = {true}
          bordered 
        />
      </div>
     
    </div>

  );
};

export default MyTable;
