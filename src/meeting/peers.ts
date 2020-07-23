import Peer from 'simple-peer'
import * as utils from './utils'

type IPeers = {
  [clientID: string]: Peer.Instance
}

const peers: IPeers = {}

function createPeer(initiator: boolean) {
  const peer = new Peer({initiator})
  peer.on('signal', (e) => {
    console.log('signal', e)
  })
  peer.on('connect', (e) => {
    console.log('connect', e)
  })
  peer.on('data', (e) => {
    console.log('data', e)
  })
  peer.on('stream', (e) => {
    console.log('stream', e)
  })
  peer.on('track', (e) => {
    console.log('track', e)
  })
  peer.on('close', () => {
    console.log('close')
  })
  peer.on('error', (e) => {
    console.log('error', e)
  })
}

utils.onStreamChange((change) => {
  Object.values(peers).forEach(peer => {
    if (change.oldValue) peer.removeStream(change.oldValue)
    peer.addStream(change.newValue)
  })
})