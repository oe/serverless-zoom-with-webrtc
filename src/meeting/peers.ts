import Peer from 'simple-peer'
import * as utils from './utils'
import * as api from './api'


export interface PeerInstance extends Peer.Instance {
  peerID?: string
}

type IPeers = {
  [clientID: string]: PeerInstance
}

export interface ILocalConnector {
  isHost: boolean
  peer: PeerInstance
  client: IClient
}


export interface IClient {
  id: string
  conn: string
}

export type IPeerChangedCb = (peer: PeerInstance) => void
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

export function listenPeerCreated(cb: IPeerChangedCb) {
  peerCreatedCb = cb
}

export function listenPeerClosed(cb: IPeerChangedCb) {
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

utils.listenStreamChange((change) => {
  Object.values(PEERS).forEach(peer => {
    if (change.oldValue) peer.removeStream(change.oldValue)
    peer.addStream(change.newValue)
  })
})


export async function tryAutoJoin(session: api.ISession) {
  const clientID = utils.getClientID()
  // client never connected before
  if (!session.connectedClientIDs.includes(clientID)) {
    console.warn('[tryAutoJoin] current client never connected to this meeting before')
    return
  }
  const allClientIDs = Object.keys(session.ticketHouse)
  const peerIDs = allClientIDs.filter(c => c !== clientID)
  if (!peerIDs.length) {
    // is host
    createPeer(true, '#1')
    return
    if (peerIDs.length === 1 && session.host === peerIDs[0]) {

    }
  }
  // the second one to enter the meeting
  if (peerIDs.length === 1) {
    // only one peer, but not the host peer, aka is the last disconnected peer
    if (peerIDs[0] !== session.host) {
      createPeer(true, '#1')
      return
    }
    if (session.firstClientTicket?.offer.id === peerIDs[0]) {
      const peer = await createPeer(false, session.host)
      session.firstClientTicket?.offer.ticket.forEach(f => {
        peer.signal(f)
      })
      return
    }
  }
  peerIDs.forEach(id => {
    createPeer(true, id)
  })
  return
}