
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
  isReady: boolean
  hasPermission: boolean
}

class App extends React.Component<Props, IState> {
  constructor (props: Props) {
    super(props)
    this.state = {
      isSupportRTC: utils.isSupportRTC(),
      isReady: false,
      hasPermission: false
    }
  }
  async componentDidMount() {
    const hasPerm = await utils.hasMediaPermission()
    this.setState({
      hasPermission: hasPerm
    })
  }
  setReady = () => {
    this.setState({isReady: true})
  }
  render() {
    return (<>
    {(!this.state.isSupportRTC || !this.state.isReady) && <Landing supportRTC={this.state.isSupportRTC} setReady={this.setReady}/>}

    {this.state.isReady && <Meeting setReady={this.setReady}/>}
    </>)
  }
}

export default hot(App);
