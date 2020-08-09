import tcb from 'tcb-js-sdk'

const app = tcb.init({
  env: 'tcb-demo-10cf5b'
})

const auth = app.auth({
  persistence: 'local'
})

const db = app.database()
// 会议表名称
const MEETING_COLLECTION = 'meeting-simple'

async function signIn() {
  if (auth.hasLoginState()) return true
  await auth.signInAnonymously()
  return true
}

export async function createMeeting(meeting) {
  await signIn()
  meeting.createdAt = Date.now()
  const result = await db.collection(MEETING_COLLECTION).add(meeting)
  return result
}