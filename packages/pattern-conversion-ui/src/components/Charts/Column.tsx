
import { Column } from '@ant-design/plots';

export default () => {
    const barConfig = {
        data: [
            { type: 'new', value: 3 },
            { type: 'done', value: 5 },
            { type: 'changed', value: 5 },
            { type: 'failed', value: 10 },
        ],
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

