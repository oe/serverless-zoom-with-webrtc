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
  const result = await app.callFunction({
    name: 'create-meeting-meeting-simple',
    data: meeting
  })
  if (result.result.code) {
    throw new Error(result.result.message)
  }
  return result.result.data
}

let cachedMeeting
export async function getMeeting(meetingId) {
  // 使用缓存
  if (cachedMeeting && cachedMeeting.id === meetingId) return cachedMeeting.meeting
  await signIn()
  const result = await db.collection(MEETING_COLLECTION).doc(meetingId).get()
  if (!result.data || !result.data.length) {
    // 无结果亦缓存
    cachedMeeting = {id: meetingId}
    return
  }
  const meeting = result.data[0]

  cachedMeeting = {id: meetingId, meeting}
  return meeting
}

export async function joinMeeting(data) {
  await signIn()
  const result = await app.callFunction({
    name: 'join-meeting-meeting-simple',
    data
  })
  if (result.result.code) {
    throw new Error(result.result.message)
  }
  
  return true
}

export async function updateTicket(data) {
  await signIn()
  const res = await app.callFunction({
    name: 'update-ticket-meeting-simple',
    data
  })
  return res
}


let watcher = null
export async function watchMeeting(meetingId, onChange) {
  await signIn()
  watcher && watcher.close()
  watcher = db.collection(MEETING_COLLECTION)
    .doc(meetingId)
    .watch({
      onChange: (snapshot) => {
        console.error(snapshot)

        if (!snapshot.docChanges ||
          !snapshot.docChanges.length ||
          !snapshot.docChanges[0].doc
          ) return

        onChange(snapshot.docChanges[0].doc)
      },
      onError: (err) => {
        console.log('watch error', err)
      }
    })
}