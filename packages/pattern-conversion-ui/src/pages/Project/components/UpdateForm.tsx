import {
    ProFormDateTimePicker,
    ProFormRadio,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    StepsForm,
  } from '@ant-design/pro-components';
  import { Modal } from 'antd';
  import React from 'react';
  
  export interface FormValueType extends Partial<API.UserInfo> {
    target?: string;
    template?: string;
    type?: string;
    time?: string;
    frequency?: string;
  }
  
  export interface UpdateFormProps {
    onCancel: (flag?: boolean, formVals?: FormValueType) => void;
    onSubmit: (values: FormValueType) => Promise<void>;
    updateModalVisible: boolean;
    values: Partial<API.UserInfo>;
  }
  
  const UpdateForm: React.FC<UpdateFormProps> = (props) => (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title="点击转换按钮的前置操作"
            open={props.updateModalVisible}
            footer={submitter}
            onCancel={() => props.onCancel()}
          >
            {dom}
          </Modal>
        );
      }}
      onFinish={props.onSubmit}
    >
      <StepsForm.StepForm
        initialValues={{
          name: props.values.name,
          nickName: props.values.nickName,
        }}
        title="选择setup路径"
      >
        <ProFormText
          width="md"
          name="name"
          label="setup path"
          rules={[{ required: true, message: '请输入规则名称！' }]}
          placeholder={'可在当前系统内弹框选择'}
        />
       
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          type: '1',
          frequency: 'month',
        }}
        title="确认转换信息"
      >
      <ProFormText
          width="md"
          name="name"
          label="项目名字"
          rules={[{ required: true, message: '请输入规则名称！' }]}
          placeholder={'project1'}
        />
        <ProFormText
          width="md"
          name="name"
          label="查看当前setup配置文件"
          rules={[{ required: true, message: '请输入规则名称！' }]}
          placeholder={'点我开始查看'}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
  
  export default UpdateForm;
  