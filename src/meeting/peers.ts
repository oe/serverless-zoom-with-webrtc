import Peer from 'simple-peer'
import * as utils from './utils'
import * as api from './api'


export interface PeerInstance extends Peer.Instance {
  id: string
  peerID: string
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
  const peer = new Peer({initiator}) as PeerInstance
  const stream = await utils.getMediaStream({audio: true, video: true})
  peer.addStream(stream)
  peer.id = peerID
  peer.peerID = peerID
  peer.on('signal', (e) => {
    console.log('[peer event]signal', e)
    // peerID with #1 for host
    // @ts-ignore
    updateTicket(e, peer.peerID)
  })
  peer.on('connect', (e) => {
    console.log('[peer event]connect', e)
  })
  peer.on('data', (e) => {
    console.log('[peer event]data', e)
  })
  peer.on('stream', (e) => {
    console.log('[peer event]stream', e)
    // streamChangedCb && streamChangedCb()
  })
  peer.on('track', (e) => {
    console.log('[peer event]track', e)
  })
  peer.on('close', () => {
    console.log('[peer event]close')
    peerClosedCb && peerClosedCb(peer)
    // remove closed peer
    delete PEERS[peer.peerID]
  })
  peer.on('error', (e) => {
    console.log('[peer event]error', e)
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

export function onTicketsChange(changes: api.ITicketGroup, firstPeerID: string) {
  Object.keys(changes).forEach(async peerID => {
    const ticket = changes[peerID]
    let peer = PEERS[peerID]
    
    if (!peer && firstPeerID === peerID) {
      peer = PEERS['#1']
      if (peer) {
        peer.peerID = peerID
        delete PEERS['#1']
        PEERS[peerID] = peer
      }
    }

    if (!peer) {
      peer = await createPeer(false, peerID)
      // console.warn(`can not find peer of ${peerID}`)
      // return
    }
    console.warn('signal', ticket)
    ticket.forEach(item => peer.signal(item))
  })
}


let cachedTicket: any = {}
let tid = 0
function updateTicket(signal: any, peerID: string) {
  const c = cachedTicket[peerID] || []
  c.push(signal)
  cachedTicket[peerID] = c
  clearTimeout(tid)
  // @ts-ignore
  tid = setTimeout(async () => {
    const data = cachedTicket
    cachedTicket = {}
    try {
      const result = await api.updateTicket(data)
      console.warn('[updateTicket] success', result)
    } catch (error) {
      console.warn('[updateTicket] failed', error)
    }
  }, 100);
}

utils.listenStreamChange((change) => {
  Object.values(PEERS).forEach(peer => {
    if (change.oldValue) peer.removeStream(change.oldValue)
    peer.addStream(change.newValue)
  })
})


export async function tryJoinMeeting(session: api.ISession) {
  const clientID = utils.getClientID()
  // client never connected before
  if (!session.connectedClientIDs.includes(clientID)) {
    console.warn('[tryAutoJoin] current client never connected to this meeting before')
    return false
  }
  console.warn('try join meeting', session)
  const allClientIDs = Object.keys(session.ticketHouse)
  const peerIDs = allClientIDs.filter(c => c !== clientID)
  if (!peerIDs.length) {
    // is host
    createPeer(true, '#1')
    return true
  }
  // the second one to enter the meeting
  if (peerIDs.length === 1) {
    // only one peer, but not the host peer, aka is the last disconnected peer
    if (peerIDs[0] !== session.host) {
      createPeer(true, '#1')
      return true
    }
    // only the host is online
    if (session.firstClientTicket?.offer.id === peerIDs[0]) {
      const peer = await createPeer(false, session.host)
      session.firstClientTicket?.offer.ticket.forEach(f => {
        peer.signal(f)
      })
      return true
    }

    console.warn('situation that not captured', session)
    return
  }
  peerIDs.forEach(id => {
    console.log('create peer', id)
    createPeer(true, id)
  })
  return true
}