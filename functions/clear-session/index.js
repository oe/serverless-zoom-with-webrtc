const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = app.database()

exports.main = async function () {
  const now = Date.now()
  // last day
  const threshold = now - 2 * 24 * 60 * 60 * 1000
  const _ = db.command
  try {
    await db
      .collection('sessions')
      .where({
        createdAt: _.lte(threshold)
      })
      .remove()
    
  } catch (error) {
    console.log('failed to batch remove', error)
  }
}