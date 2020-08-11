const tcb = require('@cloudbase/node-sdk')
const MEETING_COLLECTION = 'meeting-simple'
const MEETING_PASS_COLLECTION = 'meeting-simple-pass'
const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = app.database()


exports.main = async function (evt) {
  const now = Date.now()
  const pass = evt.pass
  delete evt.pass
  evt.hasPass = !!pass
  evt.createdAt = now
  
  try {
    const result = await db
      .collection(MEETING_COLLECTION)
      .add(evt)
    
    if (evt.hasPass) {
      const data = {
        createdAt: now,
        meetingId: result.id,
        pass
      }
      await db
      .collection(MEETING_PASS_COLLECTION)
      .add(data)
    }

    return {
      code: 0,
      data: result
    }
  } catch (error) {
    return {
      code: 2,
      message: 'failed to query session info',
      extra: error
    }
  }
}