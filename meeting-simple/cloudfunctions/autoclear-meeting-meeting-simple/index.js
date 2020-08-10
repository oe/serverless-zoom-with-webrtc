const tcb = require('@cloudbase/node-sdk')
const MEETING_COLLECTION = 'meeting-simple'
const MEETING_PASS_COLLECTION = 'meeting-simple-pass'
const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = app.database()
/**
 * 定时触发, 自定清理两天前的会议记录
 * 
{
    "triggers": [
        {
            "name": "clear-time-trigger",
            "type": "timer",
            "config": "0 0 2 * * * *"
        }
    ]
}
 */

exports.main = async function () {
  const now = Date.now()
  // 2天前
  const threshold = now - 2 * 24 * 60 * 60 * 1000
  const _ = db.command
  try {
    await db
      .collection(MEETING_COLLECTION)
      .where({
        createdAt: _.lte(threshold)
      })
      .remove()
    
    await db
      .collection(MEETING_PASS_COLLECTION)
      .where({
        createdAt: _.lte(threshold)
      })
      .remove()
    
  } catch (error) {
    console.log('failed to batch remove', error)
  }
}