import tcb from 'tcb-js-sdk'
// import cfg from '../../cloudbaserc'
import Peer from 'simple-peer'
import * as utils from './utils'

export interface ISession {
  /** session id */
  sessID: string
  /** meeting title */
  title: string
  /** created time */
  createdAt: number
  /** client that ever connected to this session */
  connectedClientIDs: string[]
  /** temp */
  firstClientTicket?: {
    /** creator's ticket */
    offer: {
      id: string
      ticket: ITicket[]
    }
    /** peer's ticket */
    answer?: {
      id: string
      ticket: ITicket[]
    }
  }
  /** pass code, if none then null */
  pass: null | string
  /** host id */
  host: string
  /** all ticket in the meeting */
  ticketHouse: ITicketHouse
}

export type ITicketHouse = {
  [clientID: string]: ITicketGroup
}

export type ITicketGroup = {
  [peerID: string]: ITicket[]
}

export type ITicket = {}


export interface IClient {
  id: string
  conn: string
  // isMuted: boolean
  // mutedBy: 'owner' | 'self' | 'none'
  // isCameraOff: boolean
}

const app = tcb.init({
  env: 'tcb-demo-10cf5b'
})

const auth = app.auth({
  persistence: 'local'
})

async function signIn() {
  if (auth.hasLoginState()) return true
  await auth.signInAnonymously()
  return true
}

export interface ISessionDigest {
  /** session id */
  sessID: string
  /** meeting title */
  title: string
  /** created time */
  createdAt: number
  /** pass code, if none then null */
  hasPass: boolean
  /** host id */
  host: string
}

export let CACHED_SESSION_INFO: ISessionDigest | undefined
export async function getSessionInfo(sessID: string) {
  if (CACHED_SESSION_INFO && CACHED_SESSION_INFO.sessID === sessID) return CACHED_SESSION_INFO
  await signIn()
  const result = await tcb.callFunction({
    name: 'get-session',
    data: {
      sessID,
      clientID: utils.getClientID()
    }
  })
  if (!result.result.code) {
    CACHED_SESSION_INFO = result.result.data as ISessionDigest
    return CACHED_SESSION_INFO
  }
  throw new Error('get session failed ' + JSON.stringify(result))
}


export interface IMeetingMeta {
  title: string
  pass: string
}

export async function createMeeting(meta: IMeetingMeta) {
  await signIn()
  const clientID = utils.getClientID()
  const session: ISession = {
    ...meta,
    sessID: utils.generateSessID(),
    connectedClientIDs: [clientID],
    host: clientID,
    createdAt: Date.now(),
    ticketHouse: {
      [clientID]: {}
    }
  }
  const result = await tcb.callFunction({
    name: 'create-session',
    data: session
  })
  console.log('create meeting', result)
  if (result.result.code) throw new Error('failed to create meeting ' + JSON.stringify(result.result))
  // @ts-ignore
  CACHED_SESSION_INFO = session
  return {sessID: session.sessID, id: result.result.data.id}
}

// export interface IUpdateTicketData {
//   sessID: string
//   ticketGroup: ITicketGroup
//   clientID: string
// }
export async function updateTicket(ticketGroup: ITicketGroup) {
  await signIn()
  const data = {
    sessID: CACHED_SESSION_INFO?.sessID,
    clientID: utils.getClientID(),
    ticketGroup
  }
  console.log('update ticket', data)
  const result = await tcb.callFunction({
    name: 'update-ticket',
    data
  })
  return result.result
}

let watcher:any = null
export async function watchSession(_id: string, onChange: (ticketGroup: ITicketGroup, peerId: string) => void) {
  console.log('start to watch db of doc id', _id)
  await signIn()
  watcher?.close()
  watcher = app.database().collection('sessions')
    .doc(_id)
    .watch({
      onChange: (snapshot) => {
        console.error(snapshot)
        if (!snapshot.docs.length ||
          !snapshot.docs[0] ||
          !snapshot.docs[0].ticketHouse ||
          !snapshot.docs[0].ticketHouse[utils.getClientID()]
          ) return
        const firstPeerID = snapshot.docs[0].firstClientTicket?.answer?.id || ''
        onChange(snapshot.docs[0].ticketHouse[utils.getClientID()], firstPeerID)
      },
      onError: (err) => {
        console.log('watch error', err)
      }
    })
}

export function connect2peer(peer: Peer.Instance, selfID: string, clients: IClient[]) {

  clients.filter(c => c.id !== selfID)
  if (!clients.length) return false
  const connArr = JSON.parse(clients[0].conn) as string[]
  connArr.forEach(str => {
    peer.signal(str)
  })
  return true
}

export async function joinMeeting (sessID: string, pass?: string) {
  await signIn()
  const result = await tcb.callFunction({
    name: 'join-session',
    data: {
      pass,
      sessID: sessID,
      clientID: utils.getClientID()
    }
  })
  console.log('join meeting', result.result)
  return result.result
}
// @ts-ignore
window.connect2peer = connect2peer