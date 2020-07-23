import React, { Component } from 'react'
import Peer from 'simple-peer'
import * as utils from './utils'

interface IProps {
  peer?: Peer.Instance
}

interface IState {
  stream?: MediaStream
  // videoRef: React.Ref<HTMLVideoElement>
  isSelf: boolean
  streamOptions: {
    video: boolean
    audio: boolean
  }
}

type IStreamCb = (stream: MediaStream) => void

export default class MeetingWindow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    const isSelf = !props.peer
    
    this.state = {
      // videoRef: React.createRef<HTMLVideoElement>(),
      isSelf,
      streamOptions: { video: true, audio: true}
    }
  }
  videoRef = React.createRef<HTMLVideoElement>()
  streamCbs: IStreamCb[] = []

  componentDidMount () {
    this.updateMediaStream()
  }

  componentDidUpdate () {
    this.updateMediaStream()
  }

  updateMediaStream() {
    if (this.props.peer) {
      this.props.peer.off('stream', this.onGetStream)
      this.props.peer.on('stream', this.onGetStream)
      return
    }
    utils.getMediaStream(this.state.streamOptions).then(this.onGetStream)
  }

  onGetStream = (stream: MediaStream) => {
    console.error('get stream', this.props.peer)
    this.updateStream(stream)
    this.streamCbs.forEach(cb => cb(stream))
  }

  updateStream = (stream: MediaStream) =>{

    const dom = this.videoRef.current
    if (!dom) return
    dom.muted = this.state.isSelf
    if ('srcObject' in dom) {
      dom.srcObject = stream
      dom.onloadedmetadata = function() {
        dom.play();
      };
      return
    }
    // @ts-ignore
    dom.src = URL.createObjectURL(stream)
    // @ts-ignore
    dom.play()
  }

  render() {
    return (
      <video ref={this.videoRef} controls={!this.state.isSelf} width="640" height="480"></video>
    )
  }
}
