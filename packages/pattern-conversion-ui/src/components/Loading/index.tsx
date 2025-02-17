import { Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './style.less'

const Loading = () => {
  // 自定义旋转的加载图标
  const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
  
  return (
    <div className={styles.loadingContainer}>
      <Space size="middle">
        数据加载中,请耐心等待
        <Spin indicator={antIcon} />
      </Space>
    </div>
  );
};

export default Loading;
