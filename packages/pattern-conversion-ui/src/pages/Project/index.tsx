import { DownOutlined, ReloadOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { FC, useRef, useState } from "react";
import './style.less';  
import TerminalOutput from "@/components/TerminalOutput";
import UpdateForm from "./components/UpdateForm";
import { ActionType } from "@ant-design/pro-components";

const Poject: FC<any> = () => {

    const items: MenuProps['items'] = [

        {
            key: '2',
            label: 'project2',
        },
        {
            key: '3',
            label: 'project3',
        },

    ];
    const [showB, setShowB] = useState(true); // 初始状态为显示 B 组件
    const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
    const actionRef = useRef<ActionType>();
    const [stepFormValues, setStepFormValues] = useState({});
 
  const toggleB = () => {
    setShowB(!showB); // 切换 B 组件的显示状态
  };
    return <div className="gradient-border-bottom">
        <div style={{ width: 300, display: 'flex', justifyContent: 'space-between', alignItems:'center',backgroundColor:'rgb(178, 191, 214)',borderRadius:5 }}>
            <div style={{width:250}}>
                <Dropdown menu={{ items }} >
                    <a onClick={(e) => e.preventDefault()} style={{marginRight:10}}>
                        <Space>
                            project1
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>

                <a onClick={(e) => e.preventDefault()} style={{marginRight:10}}>
                    <ReloadOutlined />
                </a>

                <a onClick={(e) => e.preventDefault()}>
                    <ZoomInOutlined />
                </a>
            

            </div>
            <div>
                <Button type="primary"    onClick={() => {
              handleUpdateModalVisible(true);
             console.log('strp');
             
            }}>Run conversion</Button>
            </div>


        </div>

        <div className="line"></div>

        <button style={{marginTop:800}} onClick={toggleB}>toggle termnal</button>
        {
            showB &&(
            <TerminalOutput />
            )
        }
         {updateModalVisible && (
        <UpdateForm
          onSubmit={async (value) => {
            const success = true
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) }


    </div>
}

export default Poject