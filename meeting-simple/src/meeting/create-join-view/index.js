/* eslint-disable no-restricted-globals */
import React, { useState, useCallback, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import * as api from '../api'



export default function CreateJoinView(props) {
  const [data, setData] = useState({isReady: false})
  useEffect(() => {
    (async ()=> {
      try {
        const meetingId = location.hash.slice(1)
        if (!meetingId) return setData({isReady: true})
        const result = await api.getMeeting(meetingId)
        if (!result) {
          message.warn('Meeting not exists, you can create on instead')
          location.hash = ''
          return setData({isReady: true})
        }
        return setData({isReady: true, meeting: result})
      } catch (error) {
        message.warn('Failed to init meeting',  0)
      }
    })()
  }, [])

  const onCreateMeeting = async (values) => {
    const result = await api.createMeeting(values)
    message.success(`Meeting created with id ${result.id}`)
    // 更新 hash 用于分享
    location.hash = result.id
    props.updateMeeting('pending', values.pass)
    return true
  }

  const onJoinMeeting = async (vals) => {
    await api.joinMeeting(vals)
    props.updateMeeting('connecting')
  }


  if (!data.isReady) {
    return <div>loading...</div>
  }
  return data.meeting ?
    <JoinMeeting meeting={data.meeting} onSubmit={onJoinMeeting} /> :
    <CreateMeeting onSubmit={onCreateMeeting} />
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
        <Input disabled={isLoading} autoFocus/>
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

function JoinMeeting(props) {
  const layout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 16
    },
  }
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  }

  const [form] = Form.useForm()
  const [isLoading, setLoading] = useState(false)
  
  const onSubmit = useCallback(async (values) => {
    setLoading(true)
    try {
      await props.onSubmit({...values, id: props.meeting._id})
    } catch (error) {
      message.error('failed to enter meeting: ' + error.message)
      console.log('failed to enter meeting', error)
      setLoading(false)
    }
  }, [props])

  // 跳转至创建会议页面
  const gotoCreateView = () => {
    location.hash = ''
    location.reload()
  }

  return (
    <Form {...layout} form={form} onFinish={onSubmit}>
      <h4>Join the meeting</h4>
      <h1>{props.meeting.title}</h1>
      {props.meeting.hasPass ? <Form.Item
        name="pass"
        label="Meeting passcode"
        rules={[{ required: true }, {}]}
      >
        <Input placeholder="this meeting require a passcode" autoFocus disabled={isLoading} />
      </Form.Item> : <p>This is a open meeting, click <b>Enter Meeting</b> to join it now!</p>}
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading}>
        Enter Meeting
        </Button>
        <Button type="link" htmlType="button" onClick={gotoCreateView}>
          create my own meeting instead
        </Button>
      </Form.Item>
    </Form>
  )
}

