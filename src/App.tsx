
import React from 'react'
import { hot } from "react-hot-loader/root"
import * as utils from './utils'
import NotSupport from './Not-Support'
import Session from './Session-View'


interface Props {
  name?: string
}

interface IState {
  isSupportRTC: boolean
  hasPermission: boolean
}

class App extends React.Component<Props, IState> {
  constructor (props: Props) {
    super(props)
    this.state = {
      isSupportRTC: utils.isSupportRTC(),
      hasPermission: false
    }
  }
  async componentDidMount() {
    const hasPerm = await utils.hasMediaPermission()
    this.setState({
      hasPermission: hasPerm
    })
  }
  render() {
    if (!this.state.isSupportRTC) return <NotSupport />
    return <Session />
  }
}

export default hot(App);
