
//  {
//   pass,
//   sessID: sessID,
//   clientID: utils.getClientID()
// }
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
    
    if (!sessions.data || !sessions.data.length) return {
      code: 2,
      message: 'meeting not exists'
    }
    const session = sessions.data[0]

    if (!evt.clientID) return {
      code: 3,
      message: 'client id required'
    }
    
    const clientID = evt.clientID
    const isConnectedBefore = session.connectedClientIDs.includes(clientID)
    // not connected before and passcode not match
    if (!isConnectedBefore && 
      (session.pass && session.pass !== evt.pass)) return {
      code: 4,
      message: 'meeting passcode not match'
    }
    
    const chunk = {}
    if (!isConnectedBefore) {
      session.connectedClientIDs.push(clientID)
      chunk.connectedClientIDs = session.connectedClientIDs
    }
    // creator's offer no answer
    if (session.firstClientTicket && !session.firstClientTicket.answer) {
      session.firstClientTicket.answer = {id: clientID}

      if (session.ticketHouse[clientID] || !session.firstClientTicket.offer) {
        throw new Error('inner error')
      }

      session.ticketHouse[clientID] = {
        [session.host]: session.firstClientTicket.offer.ticket
      }

      chunk.firstClientTicket = session.firstClientTicket
      chunk.ticketHouse = session.ticketHouse
    } else {
      session.ticketHouse[clientID] = {}
      chunk.ticketHouse = session.ticketHouse
    }

    await db.collection('sessions').doc(session._id).update(chunk)
    // get all connected client id
    const allConnectedClientIDs = Object.keys(session.ticketHouse)
    delete session.pass
    return {
      code: 0,
      data: session
    }
  } catch (error) {
    return {
      code: -1,
      message: 'failed to join meeting',
      extra: error
    }
  }
}