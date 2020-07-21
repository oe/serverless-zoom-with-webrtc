import tcb from 'tcb-js-sdk'
import cfg from '../cloudbaserc'
import md5 from 'md5'

interface ISession {
  /** meeting id */
  title: string
  /** created time */
  createdAt: number
  /** last active time */
  lastActiveAt: number
  /** pass code, if none then null */
  pass: null | string
  /** host id */
  host: string
  /** all client id */
  clients: IClient[]
}

interface IClient {
  id: string
  conn: string
  isMuted: boolean
  mutedBy: 'owner' | 'self' | 'none'
  isCameraOff: boolean
}

const app = tcb.init({
  env: cfg.envId
})

async function signIn() {
  const auth = app.auth({
    persistence: 'local'
  })
  if (auth.hasLoginState()) return true
  await auth.signInAnonymously()
}

function getLocalConn(): IClient {
  const conn = 'xxxx'
  return {
    id: md5(conn),
    conn,
    isMuted: true,
    mutedBy: 'none',
    isCameraOff: false
  }
}

function isSessionExist(sessID: string) {
  
}


