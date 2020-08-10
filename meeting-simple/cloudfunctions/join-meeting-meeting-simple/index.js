const tcb = require('@cloudbase/node-sdk')
const MEETING_COLLECTION = 'meeting-simple'
const MEETING_PASS_COLLECTION = 'meeting-simple-pass'
const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = app.database()


exports.main = async function (evt) {
  
  try {
    const result = await db.collection(MEETING_COLLECTION).doc(evt.id).get()
    if (!result.data || !result.data.length) return {code: 1, message: 'meeting not exists'}
    const meeting = result.data[0]
    
    if (meeting.hasPass) {
      const passResult = await db.collection(MEETING_PASS_COLLECTION).where({meetingId: evt.id}).get()
      if (!passResult.data || !passResult.data.length) return {code: 2, message: 'pass not exists'}
    }
    return { code: 0 }
  } catch (error) {
    return {
      code: 3,
      message: error.message
    }
  }
}