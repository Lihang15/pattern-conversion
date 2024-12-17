import React from 'react';
import { Modal, message } from 'antd';
import { ProForm, ProFormSelect, ProFormDatePicker, ProFormGroup, ProFormText } from '@ant-design/pro-components';

const FloatingForm = ({ onClose, onSubmit }) => {
  const handleFinish = async (values) => {
   
    onSubmit(values);
  };

  return (
    <Modal
      title="新增项目"
      open
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <ProForm
        onFinish={handleFinish}
        initialValues={{
        //   prjectName: 'my project',
        //   useMode: 'chapter',
        }}
        autoFocusFirstInput
        submitter={{
          searchConfig: {
            submitText: '提交',
          },
          submitButtonProps: {
            type: 'primary',
          },
        }}
      >

          <ProFormText width="md" name="projectName" label="Project Name"  rules={[{ required: true, message: '请输入项目名字！' }]}/>
          <ProFormText width="md" name="path" label="Resource Path"  rules={[{ required: true, message: '请输入资源路径！' }]}/>
      </ProForm>
    </Modal>
  );
};

export default FloatingForm;
