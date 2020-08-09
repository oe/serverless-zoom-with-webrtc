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

export async function getMeeting(meetingId) {
  await signIn()
  const result = await db.collection(MEETING_COLLECTION).doc(meetingId).get()
  if (!result.data || !result.data.length) return
  const meeting = result.data[0]

  meeting.hasPass = !!meeting.pass
  delete meeting.pass
  return meeting
}

export async function joinMeeting(data) {
  await signIn()
  const result = await db.collection(MEETING_COLLECTION).doc(data.id).get()
  if (!result.data || !result.data.length) throw new Error('meeting not exists')

  const meeting = result.data[0]
  if (meeting.pass && meeting.pass === data.pass) throw new Error('passcode not match')
  return true
}
