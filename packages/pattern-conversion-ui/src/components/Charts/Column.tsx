
import { Column } from '@ant-design/plots';

interface ColumnType{
    data: []
  }
const ColumnChart: React.FC<ColumnType> =  ({ data } ) => {
    const barConfig = {
        data: data?.length?data: [],
        xField: 'type',
        yField: 'value',
        colorField: 'type',
        axis: {
            x: {
                // size: 40,
                // labelFormatter: (datum, index) => medal(datum, index),
            },
        },
        // onReady: (plot) => (chartRef.current = plot),

    }


    return <Column {...barConfig} />;
};

export default ColumnChart

