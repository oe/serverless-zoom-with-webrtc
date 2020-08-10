/* eslint-disable no-restricted-globals */
import React, { useState, useCallback } from 'react'
import { Form, Input, Button, message } from 'antd'
import * as peers from '../peer'
import * as api from '../api'

export default function CreateJoinView(props) {

  const onCreateMeeting = async (values) => {
    const result = await api.createMeeting(values)
    message.success(`Meeting created with id ${result.id}`)
    console.warn('create meeting', result.id)
    // 更新 hash 用于分享
    location.hash = result.id
    const peer = await peers.createPeer(true, result.id)

    props.updateMeeting('pending', values.pass, peer)

    setTimeout(() => {
      api.watchMeeting(result.id, (doc) => {
        doc.answer && peers.signalTickets(peer, doc.answer)
      })
    }, 0)
    return true
  }

  const onJoinMeeting = async (vals) => {
    await api.joinMeeting(vals)
    const peer = await peers.createPeer(false, vals.id)
    props.updateMeeting('connecting', '', peer)
    setTimeout(() => {
      peers.signalTickets(peer, props.meeting.offer)
      api.watchMeeting(vals.id, (doc) => {
        doc.offer && peers.signalTickets(peer, doc.offer)
      })
    }, 0)
  }

  return props.meeting ?
    <JoinMeeting meeting={props.meeting} onSubmit={onJoinMeeting} /> :
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
      message.error('Failed to enter meeting: ' + error.message)
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

