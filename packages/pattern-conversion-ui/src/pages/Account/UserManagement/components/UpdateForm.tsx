import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

const UpdateForm: React.FC<any> = ({ updateModalVisible, onCancel, onSubmit, values }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (values) {
      form.setFieldsValue(values); // 当 values 更新时，表单字段值也随之更新
    }
  }, [values, form]);

  return (
    <Modal
      title="编辑信息"
      open={updateModalVisible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            form
              .validateFields()
              .then((value) => {
                onSubmit(value); // 提交表单
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          提交
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="update-form">
        <Form.Item
          name="username"
          label="username"
          rules={[{ required: true, message: '请输入名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="email"
          rules={[{ required: true, message: '请输入邮箱!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="password"
          rules={[{ required: true, message: '请输入描述!' }]}
        >
         <Input />
        </Form.Item>
        <Form.Item
          name="roles"
          label="roles"
          rules={[{ required: true, message: '请输入描述!' }]}
        >
         <Input />
        </Form.Item>
        {/* 可以根据需要添加更多表单项 */}
      </Form>
    </Modal>
  );
};

export default UpdateForm;
