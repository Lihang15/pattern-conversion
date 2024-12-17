
import { Bar } from '@ant-design/plots';

export default () => {
    const barConfig = {
        data: [
          { type: 'new', value: 3 },
          { type: 'done', value: 5 },
          { type: 'changed', value: 5 },
          { type: 'failed', value: 10 },
        ],
        scale: {
          x: { 
            type:'band',
            /* 其他配置项 */ 
            padding:0.4
          }
        },
        xField: 'type',
        yField: 'value',
        colorField: 'type',
        state: {
          unselected: { opacity: 0.5 },
          selected: { lineWidth: 1, stroke: 'red' },
        },
        interaction: {
          elementSelect: true,
        },
        label: {
          type: 'inner',
          content: '',
        },
        onReady: ({ chart, ...rest }) => {
          chart.on(
            'afterrender',
            () => {
              const { document } = chart.getContext().canvas;
              const elements = document.getElementsByClassName('element');
              elements[0]?.emit('click');
            },
            true,
          );
        },
      };
  
  return <Bar {...barConfig} />;
};

