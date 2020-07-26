import React, { Component, useState, useCallback } from 'react'
import { message, Form, Input, Button } from 'antd'
import * as sessionUtils from './api'
import * as peers from './peers'

interface IProps {
  isHost?: boolean
  session?: sessionUtils.ISessionDigest
  updateVideoLinkInfo: Function
}

interface IState {
  status: 'init' | 'waiting'
  hasSession: boolean
  sessID: string
}

export default class SelfWindow extends Component<IProps, IState> {
  constructor (props: IProps) {
    super(props)
    this.state = {
      status: props.isHost ? 'waiting' : 'init',
      hasSession: !!props.session,
      sessID: props.session?.sessID || ''
    }
  }

  async componentDidMount() {
    // this.state.hasSession && this.tryAutoConn()
  }

  // async tryAutoConn () {
  //   try {
  //     const result = await sessionUtils.joinMeeting(this.state.sessID)
  //     console.log('try auto', result)
  //     if (this.props.isHost) {
  //       this.props.updateVideoLinkInfo({sessID: result.sessID, pass: result.pass})
  //     }
  //   } catch (error) {
  //     console.log('failed to auto join', error)
  //   }
  // }

  watchPeer = (docID: string) => {
    sessionUtils.watchSession(docID, peers.onTicketsChange)
  }

  onJoinMeeting = async (vals: any) => {
    try {
      const result = await sessionUtils.joinMeeting(this.state.sessID, vals.pass)
      if (!result.code) {
        await peers.tryAutoJoin(result.data)
        this.watchPeer(result.data._id)
        this.setState({status: 'waiting'})
      }
      return result
    } catch (error) {
      console.log('failed join', error)
    }
  }

  onCreateMeeting = async (options: sessionUtils.IMeetingMeta) => {
    const result = await sessionUtils.createMeeting(options)
    peers.createPeer(true, '#1')
    location.hash = result.sessID
    this.setState({status: 'waiting'})
    this.watchPeer(result.id)
    
    this.props.updateVideoLinkInfo({sessID: result.sessID, pass: options.pass})
    return true
  }

  render() {
    switch (this.state.status) {
      case 'init':
        if (this.state.hasSession) {
          return <JoinMeeting session={this.props.session!} onSubmit={this.onJoinMeeting}/>
        }
        return <CreateMeeting onSubmit={this.onCreateMeeting}/>
      default:
        return null
        // return <MeetingWindow peer={this.props.connector.peer}/>
    }
  }
}


interface IEnterMeetingProps {
  session: sessionUtils.ISessionDigest
  onSubmit: (val: any) => any
}

function JoinMeeting(props: IEnterMeetingProps) {
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
  const [isLoading, setLoading] = useState<boolean>(false)
  
  const onSubmit = useCallback(async (values: any) => {
    setLoading(true)
    try {
      const result = await props.onSubmit(values)
      if (result.code) {
        message.warn(result.message)
        setLoading(false)
      }
    } catch (error) {
      message.error('failed to enter meeting')
      console.log('failed to enter meeting', error)
      setLoading(false)
    }
  }, [props])

  const onCreateMeeting = () => {
    location.hash = ''
    location.reload()
  }

  return (
    <Form {...layout} form={form} onFinish={onSubmit}>
      <h4>Join the meeting</h4>
      <h1>{props.session.title}</h1>
      {props.session.hasPass ? <Form.Item
        name="pass"
        label="Meeting passcode"
        rules={[{ required: true }, {}]}
      >
        <Input placeholder="this meeting require a passcode" disabled={isLoading} />
      </Form.Item> : <p>This is a open meeting, click <b>Enter Meeting</b> to join it now!</p>}
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading}>
        Enter Meeting
        </Button>
        <Button type="link" htmlType="button" onClick={onCreateMeeting}>
          create my own meeting instead
        </Button>
      </Form.Item>
    </Form>
  )
}

interface ICreateMeetingProps {
  onSubmit: (vals: sessionUtils.IMeetingMeta) => void
}

function CreateMeeting(props: ICreateMeetingProps) {
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
  const [isLoading, setLoading] = useState<boolean>(false)
  
  const onSubmit = useCallback(async (values: any) => {
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

