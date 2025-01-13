import { Dropdown, Space } from 'antd';
import styles from './style.less'
import { DownOutlined, ReloadOutlined, ZoomInOutlined } from '@ant-design/icons';



const RunConversionHeader: React.FC = ()=>{

    return (
        <div className={styles.container}>

<div className={styles.operating_area}>
      <div className={styles.operating_buttons}>
        <div className={styles.operating_buttons_left}>
          <Dropdown menu={ menu } className={styles.drop_menu}>
            <Space>
              <div>
              {resources?.projectDropList[0].label || 'Loading...'}
              </div>
             
                <DownOutlined />
              </Space>
          </Dropdown>

          <a onClick={(e) => e.preventDefault()} className={styles.refresh_svg}>
            <ReloadOutlined />
          </a>

          <a onClick={(e) => setIsAddProject(true) }>
            <ZoomInOutlined />
          </a>


        </div>
        <div className={styles.operating_buttons_right}>
          <Button type="primary" onClick={() => {
            handleUpdateModalVisible(true);
            // setIsProgressing(true)
            // console.log('strp');

          }}>Run conversion</Button>
        </div>


      </div>

      <div className={styles.line}></div>
    </div>
        </div>
    )

}

export default RunConversionHeader