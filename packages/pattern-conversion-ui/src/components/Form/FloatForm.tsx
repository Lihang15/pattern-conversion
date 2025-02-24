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
      title="New Project"
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
            submitText: 'Submit',
            resetText: 'Reset'
          },
          submitButtonProps: {
            type: 'primary',
          },
         
        }}
      >

          <ProFormText width="md" name="projectName" label="Project Name" placeholder={'Project Name'} 
          rules={[{ required: true, message: 'Please enter the project name!' }, 
            { 
              max: 30, 
              message: 'Project name cannot exceed 30 characters!',
            },
            // {
            //   pattern: /^[\x00-\x7F\u4e00-\u9fa5]{1,20}$/, // 匹配 1 到 20 个英文字母或中文字符
            //   message: 'Project name must be up to 20 characters, including both English and Chinese!',
            // },
          ]}/>
          <ProFormText width="md" name="inputPath" label="Input Path" placeholder={'Input path for the pattern file'}
           rules={[{ required: true, message: 'Please enter the input path for the pattern file, For example, c:\\pattern\\file\\xx' }]}/>

          <ProFormText width="md" name="outputPath" label="Output Path" placeholder={'Output path after pattern conversion'} 
          rules={[{ required: true, message: 'Please enter the output path after pattern conversion' }]}/>
      </ProForm>
    </Modal>
  );
};

export default FloatingForm;
