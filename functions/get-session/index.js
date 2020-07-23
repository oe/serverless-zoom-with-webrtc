
exports.main = async function (evt) {
  const tcb = require('@cloudbase/node-sdk')
  const app = tcb.init({
    env: tcb.SYMBOL_CURRENT_ENV
  })
  const db = app.database()
  if (!evt.sessID) return {
    code: 1,
    message: 'session id is required'
  }
  try {
    const sessions = await db
      .collection('sessions')
      .where({
        sessID: evt.sessID
      })
      .get()
    // return {sessions}
    if (!sessions.data || !sessions.data.length) return {
      code: 0
    }
    const session = sessions.data[0]
    session.hasPass = !!session.pass
    // remove sensitive info
    delete session.pass
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