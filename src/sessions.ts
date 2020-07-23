import tcb from 'tcb-js-sdk'
import cfg from '../cloudbaserc'
import md5 from 'md5'
import Peer from 'simple-peer'
import * as utils from './utils'

export interface ISession {
  /** session id */
  sessID: string
  /** meeting title */
  title: string
  /** created time */
  createdAt: number
  /** last active time */
  // lastActiveAt: number
  /** pass code, if none then null */
  pass: null | string
  /** host id */
  host: string
  /** all client id */
  clients: IClient[]
}

export interface IClient {
  id: string
  conn: string
  // isMuted: boolean
  // mutedBy: 'owner' | 'self' | 'none'
  // isCameraOff: boolean
}

let conn: any = null

const app = tcb.init({
  env: cfg.envId
})

async function signIn() {
  const auth = app.auth({
    persistence: 'local'
  })
  if (auth.hasLoginState()) return true
  await auth.signInAnonymously()
  return true
}

export interface ILocalConnector {
  isHost: boolean
  peer: Peer.Instance
  client: IClient
}

export async function getLocalConn(isHost: boolean = false, ipeer?: Peer.Instance) {
  const peer = ipeer || new Peer({initiator: isHost})
  const conn: any[] = []
  return new Promise<ILocalConnector>((resolve) => {
    peer.on('signal', data => {
      conn.push(data)
      if (conn.length === 2) {
        resolve(buildConn(peer, conn, isHost))
      }
    })
  })
}

function buildConn(peer: Peer.Instance, connObj: object[], isHost: boolean): ILocalConnector {
  const conn = JSON.stringify(connObj)
  const id = md5(conn)
  return {
    isHost,
    peer,
    client: {
      id,
      conn
    }
  }
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
  /** all client id */
  clients: IClient[]
}

export async function getSessionInfo(sessID: string) {
  await signIn()
  const result = await tcb.callFunction({
    name: 'get-session',
    data: {
      sessID
    }
  })
  if (!result.result.code) return result.result.data as ISessionDigest
  throw new Error('get session failed ' + JSON.stringify(result))
}

export interface IMeetingMeta {
  title: string
  pass: string
}

export async function createSession(client: IClient, meta: IMeetingMeta) {
  await signIn()
  const session: ISession = {
    ...meta,
    sessID: utils.generateSessID(),
    host: client.id,
    createdAt: Date.now(),
    clients: [client]
  }
  const result = await tcb.callFunction({
    name: 'create-session',
    data: session
  })
  return session.sessID
}

let watcher:any = null
export async function watchSession(sessID: string, onChange: (clients: IClient[]) => void) {
  await signIn()
  watcher?.close()
  watcher = app.database().collection('sessions')
    .where({sessID})
    .watch({
      onChange: (snapshot) => {
        console.error(snapshot)
        if (!snapshot.docs.length) return
        onChange(snapshot.docs[0].clients)
      },
      onError: (err) => {
        console.log('watch error')
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

export async function joinMeeting (session: ISessionDigest, localConn: ILocalConnector, pass?: string) {
  await signIn()
  const result = await tcb.callFunction({
    name: 'join-session',
    data: {
      pass,
      sessID: session.sessID,
      client: localConn.client
    }
  })
  if (!result.result.code) {
    connect2peer(localConn.peer, localConn.client.id, result.result.data.clients)
  }
  return result.result
}