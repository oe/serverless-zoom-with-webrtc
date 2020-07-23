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
  
  try {
    const session = await db
      .collection('sessions')
      .where({
        sessID: evt.sessID
      })
    if (session.pass && session.pass !== evt.pass) return {
      code: 3,
      message: 'meeting passcode not match'
    }
    if (!evt.client) return {
      code: 4,
      message: 'client info required'
    }
    session.clients.push(evt.client)
    await db.collection('sessions').doc(session.id).update({clients: session.clients})
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