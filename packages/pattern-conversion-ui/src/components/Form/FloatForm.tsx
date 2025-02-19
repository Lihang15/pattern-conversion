import React from 'react';
import { Modal, message } from 'antd';
import { ProForm, ProFormSelect, ProFormDatePicker, ProFormGroup, ProFormText } from '@ant-design/pro-components';

const FloatingForm = ({ onClose, onSubmit }) => {
  const handleFinish = async (values) => {
    // 转义路径中的反斜杠
    const escapedValues = {
      ...values,
      inputPath: values.inputPath.replace(/\\/g, '\\\\'),
      outputPath: values.outputPath.replace(/\\/g, '\\\\'),
    };
   
    onSubmit(escapedValues);
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

          <ProFormText width="md" name="projectName" label="Project Name" placeholder={'项目名字'} rules={[{ required: true, message: '请输入项目名字！' }]}/>
          <ProFormText width="md" name="inputPath" label="Input Path" placeholder={'pattern文件的输入路径'} rules={[{ required: true, message: '请输入pattern文件的路径' }]}/>
          <ProFormText width="md" name="outputPath" label="Output Path" placeholder={'pattern转换后的输出路径'} rules={[{ required: true, message: '请输入pattern转换后的路径' }]}/>
      </ProForm>
    </Modal>
  );
};

export default FloatingForm;
