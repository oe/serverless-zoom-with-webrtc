
import React from 'react'
import { hot } from "react-hot-loader/root"
import * as utils from './meeting/utils'
import Landing from './landing'
import Meeting from './meeting'


interface Props {
  name?: string
}

interface IState {
  isSupportRTC: boolean
  readyState: string
  hasPermission: boolean
}

class App extends React.Component<Props, IState> {
  constructor (props: Props) {
    super(props)
    this.state = {
      isSupportRTC: utils.isSupportRTC(),
      readyState: 'init',
      hasPermission: false
    }
  }
  async componentDidMount() {
    const hasPerm = await utils.hasMediaPermission()
    this.setState({
      hasPermission: hasPerm
    })
  }
  setReady = (status: string) => {
    this.setState({readyState: status})
  }
  render() {
    return (<>
    {(!this.state.isSupportRTC || this.state.readyState !== 'meeting') && <Landing supportRTC={this.state.isSupportRTC} setReady={this.setReady}/>}

    {this.state.readyState !== 'init' && <Meeting setReady={this.setReady}/>}
    </>)
  }
}

export default hot(App);
