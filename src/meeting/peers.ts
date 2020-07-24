import Peer from 'simple-peer'
import * as utils from './utils'
import * as api from './api'

// declare namespace SimplePeer {
//   interface Instance {
//     peerID?: string
//   }
// }

type IPeers = {
  [clientID: string]: Peer.Instance
}

export interface ILocalConnector {
  isHost: boolean
  peer: Peer.Instance
  client: IClient
}


export interface IClient {
  id: string
  conn: string
}

export type IPeerChangedCb = (peer: Peer.Instance) => void
export const PEERS: IPeers = {}

let peerCreatedCb: IPeerChangedCb | undefined
let peerClosedCb: IPeerChangedCb | undefined


export async function createPeer(initiator: boolean, peerID: string) {
  const peer = new Peer({initiator})
  const stream = await utils.getMediaStream({audio: true, video: true})
  peer.addStream(stream)
  // @ts-ignore
  peer.peerID = peerID
  peer.on('signal', (e) => {
    console.log('signal', e)
    // peerID with #1 for host
    // @ts-ignore
    updateTicket(e, peer.peerID)
  })
  peer.on('connect', (e) => {
    console.log('connect', e)
  })
  peer.on('data', (e) => {
    console.log('data', e)
  })
  peer.on('stream', (e) => {
    console.log('stream', e)
    // streamChangedCb && streamChangedCb()
  })
  peer.on('track', (e) => {
    console.log('track', e)
  })
  peer.on('close', () => {
    console.log('close')
    peerClosedCb && peerClosedCb(peer)
  })
  peer.on('error', (e) => {
    console.log('error', e)
  })
  peerCreatedCb && peerCreatedCb(peer)
  PEERS[peerID] = peer
  return peer
}

export function onPeerCreated(cb: IPeerChangedCb) {
  peerCreatedCb = cb
}

export function onPeerClosed(cb: IPeerChangedCb) {
  peerClosedCb = cb
}

export function onTicketsChange(changes: api.ITicketGroup) {
  Object.keys(changes).forEach(peerID => {
    const ticket = changes[peerID]
    const peer = PEERS[peerID]
    if (!peer) {
      console.warn(`can not find peer of ${peerID}`)
      return
    }
    ticket.forEach(item => peer.signal(item))
  })
}


let cachedTicket: any = {}
let tid = 0
function updateTicket(signal: any, peerID: string) {
  const c = cachedTicket[peerID] || []
  c.push(signal)
  clearTimeout(tid)
  // @ts-ignore
  tid = setTimeout(() => {
    const data = cachedTicket
    cachedTicket = {}
    api.updateTicket(data)
  }, 100);
}

utils.onStreamChange((change) => {
  Object.values(PEERS).forEach(peer => {
    if (change.oldValue) peer.removeStream(change.oldValue)
    peer.addStream(change.newValue)
  })
})