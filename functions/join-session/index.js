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
    if (!session) return {
      code: 2,
      message: 'meeting not exists'
    }

    if (!evt.client) return {
      code: 3,
      message: 'client info required'
    }
    const clientID = evt.client.id
    // not connected before and passcode not match
    if (!session.clients.some(c => c.id === clientID) && 
      (session.pass && session.pass !== evt.pass)) return {
      code: 4,
      message: 'meeting passcode not match'
    }
    // remove exists clients
    const clients = session.clients.filter(c => c.id !== clientID)
    clients.push(evt.client)
    await db.collection('sessions').doc(session.id).update({clients: clients})
    // remove passcode if current user not host
    if (session.host !== clientID) {
      delete session.pass
    }

    return {
      code: 0,
      data: session
    }
  } catch (error) {
    return {
      code: -1,
      message: 'failed to query session info',
      extra: error
    }
  }
}