
import { Pie } from '@ant-design/plots';

interface PieType{
  data: []
}
const PieChart: React.FC<PieType> =  ({ data } ) => {
  
  const config = {
    data: data?.length?data: [],
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

export default PieChart

