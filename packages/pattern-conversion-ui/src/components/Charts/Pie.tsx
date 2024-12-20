
import { Pie } from '@ant-design/plots';

export default () => {
  const config = {
    data: [
      { type: 'WGL', value: 27 },
      { type: 'VCD', value: 25 },
      { type: 'STIL', value: 18 },
      { type: 'SVF', value: 15 },
      { type: '其他', value: 5 },
    ],
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'top',
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} />;
};

