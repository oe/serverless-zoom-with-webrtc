import React, { Component } from 'react'
import { message, Row, Col, Spin} from 'antd'
import * as api from './api'
import MeetingWindow from './video-window'
// import JoinCreateView from './join-create-view'
import * as utils from './utils'

const JoinCreateView = <div>ssss</div>

interface IProps {
  setReady: Function
}

interface IState {
  isInited: boolean
  sessID?: string
  session?: api.ISessionDigest
  pass?: string
  isHost: boolean
}

interface IInviteLink {
  sessID: string
  pass?: string
}

export default class SessionView extends Component<IProps, IState> {
  constructor (props: IProps) {
    super(props)
    
    this.state = {
      isInited: false,
      isHost: false
    }
  }

  async componentDidMount() {
    const sessID = location.hash.slice(1)
    let newState: Partial<IState> = {}
    if (sessID) {
      const session = await api.getSessionInfo(sessID)
      newState.session = session
      newState.isHost = !!(session?.host === utils.getClientID())
    }
    newState.isInited = true
    // @ts-ignore
    this.setState(newState)
    setTimeout(() => {
      this.props.setReady('meeting')
    }, 2000);
  }

  updateVideoLinkInfo = (info: IInviteLink) => {
    console.log('update video ', info)
    this.setState({
      ...info
    })
  }

  render() {
    if (!this.state.isInited) return null
    return (
      <div>
        <Row gutter={16} justify="space-around">
          <Col span={10} >
            <MeetingWindow />
          </Col>
          <Col span={10}>
            {/* <JoinCreateView session={this.state.session} updateVideoLinkInfo={this.updateVideoLinkInfo} isHost={this.state.isHost}/> */}
          </Col>
        </Row>
        {this.state.isHost && (<Row>
          <Col span={10} offset={8}><WaitingView sessID={this.state.sessID!} pass={this.state.pass}/></Col>
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
    <div style={{textAlign: 'center'}}>
      Meeting just created<br/>
      Please copy the following url and send it to your fellow<br />
      <code>Meeting Url: {url} {pass}</code>
    </div>
  )
}