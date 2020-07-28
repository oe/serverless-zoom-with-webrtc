/* eslint-disable no-restricted-globals */
import React, { Component } from 'react'
import { Row, Col} from 'antd'
import * as api from './api'
import MeetingWindow from './video-window'
import JoinCreateView from './join-create-view'
import * as utils from './utils'
import * as peers from './peers'


interface IProps {
  setReady: Function
}

interface IPeerConn {
  peer: peers.PeerInstance
  status: 'connecting' | 'connected'
}

interface IState {
  isInited: boolean
  // if client auto joined, then should not show JoinCreateView
  isAutoJoined: boolean
  sessID?: string
  session?: api.ISessionDigest
  pass?: string
  isHost: boolean
  peerConns: IPeerConn[]
}

interface IInviteLink {
  sessID: string
  pass?: string
}

export default class SessionView extends Component<IProps, IState> {
  constructor (props: IProps) {
    super(props)
    
    this.state = {
      isAutoJoined: false,
      isInited: false,
      isHost: false,
      peerConns: []
    }
    peers.listenPeerCreated(this.onPeerCreated)
    peers.listenPeerClosed(this.onPeerClosed)
  }

  async componentDidMount() {
    const sessID = location.hash.slice(1)
    let newState: Partial<IState> = {}
    if (sessID) {
      const session = await api.getSessionInfo(sessID)
      newState.session = session
      newState.isHost = !!(session?.host === utils.getClientID())
      // @ts-ignore
      newState.isAutoJoined = await peers.tryJoinMeeting(session)
    }
    newState.isInited = true
    // @ts-ignore
    this.setState(newState)
    setTimeout(() => {
      this.props.setReady()
    }, 2000)
  }
  
  onPeerCreated = (peer: peers.PeerInstance) =>{
    let peerConns = this.state.peerConns.slice(0)
    // @ts-ignore
    const idx = peerConns.findIndex(item => item.peer.peerID === peer.peerID)
    if (idx === -1) {
      peerConns.push({peer, status: 'connecting'})
    } else {
      peerConns[idx] = {peer, status: 'connecting'}
    }
    this.setState({peerConns})
  }

  onPeerClosed = (peer: peers.PeerInstance) => {
    let peerConns = this.state.peerConns.slice(0)
    // @ts-ignore
    const idx = peerConns.findIndex(item => item.peer.peerID === peer.peerID)
    if (idx !== -1) {
      peerConns.splice(idx, 1)
      this.setState({peerConns})
    }
  }

  setPeerReady = (peerID: string) => {
    let peerConns = this.state.peerConns.slice(0)
    // @ts-ignore
    const idx = peerConns.findIndex(item => item.peer.peerID === peerID)
    if (idx !== -1) {
      const peerConn = peerConns[idx]
      peerConns[idx] = {peer: peerConn.peer, status: 'connected'}
      this.setState({peerConns})
    }
  }

  updateVideoLinkInfo = (info: IInviteLink) => {
    console.log('update video ', info)
    this.setState({
      ...info,
      isHost: true
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
          {this.state.peerConns.map(pc => {
            return (<Col key={pc.peer.id} span={10} style={{display: pc.status === 'connecting' ? 'none' : 'block'}}>
              <MeetingWindow peer={pc.peer} setPeerReady={this.setPeerReady}/>
            </Col>)
          })}
          {!this.state.isAutoJoined && (<Col span={10}>
            <JoinCreateView session={this.state.session} updateVideoLinkInfo={this.updateVideoLinkInfo} isHost={this.state.isHost}/>
          </Col>)}
          
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
    <div>
      Meeting just created<br/>
      Please copy the following url and send it to your fellow<br />
      <div style={{background: '#eee',borderRadius: '10px',padding: '8px',textAlign: 'left'}}>Meeting Url: {url} <br /> {pass}</div>
    </div>
  )
}