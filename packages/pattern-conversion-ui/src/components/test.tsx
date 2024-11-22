import { Button } from "antd";

type BarChartProps = {
    collapsed: boolean
  };
const GlobalHeaderRight: React.FC<BarChartProps> = ({collapsed}) => {

    // if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    //   className = `${styles.right}  ${styles.dark}`;
    // }
    return (
        <Button>
        {collapsed ? '展开' : '折叠'}
      </Button>
    );
  };

  export default GlobalHeaderRight