const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = app.database()

exports.main = async function (evt) {
  if (!evt.sessID) return {
    code: 1,
    message: 'session id is required'
  }
  const now = Date.now()
  // last day
  const threshold = now - 24 * 60 * 60 * 1000
  const _ = db.command
  try {
    const session = await db
      .collection('sessions')
      .where({
        sessID: evt.sessID
      })
    // remove sensitive info
    delete session.pass
    delete session.clients
    return {
      code: 0,
      data: session
    }
  } catch (error) {
    return {
      code: 2,
      message: 'failed to query session info',
      extra: error
    }
  }
}