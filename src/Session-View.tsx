import React, { Component } from 'react'
import { Row, Col, Spin} from 'antd'
import * as sessionUtils from './sessions'
import MeetingWindow from './Meeting-Window'
import SelfWindow from './Self-Window'
import * as utils from './utils'

interface IState {
  isInited: boolean
  hasSession: boolean
  sessID: string
  session: sessionUtils.ISessionDigest | null
  connector?: sessionUtils.ILocalConnector

  isHost: boolean
  link?: string
  pass?: string
}

interface IInviteLink {
  link: string
  pass?: string
}

export default class SessionView extends Component<{}, IState> {
  constructor (props: {}) {
    super(props)
    const sessID = location.hash.slice(1)
    
    this.state = {
      isInited: false,
      hasSession: !!sessID,
      sessID,
      session: null,
      isHost: false
    }
  }

  async componentDidMount() {
    let isHost = true
    let newState: Partial<IState> = {}
    if (this.state.hasSession) {
      const sessionInfo = await sessionUtils.getSessionInfo(this.state.sessID)
      if (!sessionInfo) {
        location.hash = ''
        newState = {
          isInited: true,
          hasSession: false,
          sessID: ''
        }
      } else {
        isHost = false
        newState = {
          isInited: true,
          session: sessionInfo
        }
      }
    }
    newState.isInited = true
    newState.connector = await sessionUtils.getLocalConn(isHost)
    // @ts-ignore
    this.setState(newState)
    return
  }

  updateVideoLinkInfo = (info: IInviteLink) => {
    this.setState({
      isHost: true,
      ...info
    })
  }

  render() {
    if (!this.state.isInited) {
      return <Spin tip="loading..." style={{width: '640px', height: '480px'}} > </Spin>
    }
    return (
      <div>
        <Row gutter={16} justify="space-around">
          <Col span={10} >
            <MeetingWindow />
          </Col>
          <Col span={10}>
            <SelfWindow updateVideoLinkInfo={this.updateVideoLinkInfo} connector={this.state.connector!} session={this.state.session}/>
          </Col>
        </Row>
        {this.state.isHost && (<Row>
          <Col span={10}><WaitingView sessID={this.state.link!} pass={this.state.pass}/></Col>
        </Row>)}
      </div>
    )
  }
}

interface IWaitingViewProps {
  sessID: string
  pass?: string
}
function WaitingView(props: IWaitingViewProps) {
  const url = location.origin + location.pathname + location.search + '#' + props.sessID
  const pass = props.pass ? ` passcode: ${props.pass}` : ''
  return (
    <div>
      Meeting just created<br/>
      Please copy the following url and send it to your fellow<br />
      <code>Meeting Url: {url} {pass}</code>
    </div>
  )
}