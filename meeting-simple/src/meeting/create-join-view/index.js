/* eslint-disable no-restricted-globals */
import React, { useState, useCallback } from 'react'
import { Form, Input, Button, message } from 'antd'
import * as api from '../api'



export default function CreateJoinView(props) {

  const onCreateMeeting = async (values) => {
    const result = await api.createMeeting(values)
    message.success(`Meeting created with id ${result.id}`)
    // 更新 hash 用于分享
    location.hash = result.id
    props.updateMeeting('pending', values.pass)
    return true
  }

  return <CreateMeeting onSubmit={onCreateMeeting} />
}


function CreateMeeting(props) {
  const layout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 16
    }
  }
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  }

  const [form] = Form.useForm()
  const [isLoading, setLoading] = useState(false)
  
  const onSubmit = useCallback(async (values) => {
    setLoading(true)
    try {
      await props.onSubmit(values)
    } catch (error) {
      console.log('failed to create meeting', error)
      setLoading(false)
    }
  }, [props])

  return (
    <Form {...layout} form={form} onFinish={onSubmit} initialValues={{title: 'Top confidential meeting'}}>
      <h1 style={{textAlign: 'center'}}>Create a meeting</h1>
      <Form.Item
        name="title"
        label="Meeting Topic"
      >
        <Input disabled={isLoading}/>
      </Form.Item>
      <Form.Item
        name="pass"
        label="Meeting passcode"
      >
        <Input placeholder="leave empty for public meeting" disabled={isLoading} />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading}>
          Create Meeting
        </Button>
      </Form.Item>
    </Form>
  )
}

