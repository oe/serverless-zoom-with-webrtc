// export interface IUpdateTicketData {
//   sessID: string
//   ticketGroup: ITicketGroup
//   clientID: string
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
      .where({sessID: evt.sessID})
      .get()
    
    if (!sessions.data || !sessions.data.length) throw new Error(`meeting #${evt.sessID} not exists`)

    const session = sessions.data[0]
    const chunk = {}
    const ticketGroup = evt.ticketGroup
    const clientID = evt.clientID
    Object.keys(ticketGroup).forEach((peerID) => {
      const ticket = ticketGroup[peerID]
      // is from host
      if (evt.peerID === '#1') {
        if (session.host !== clientID) {
          throw new Error(`peer client id is invalid, #1 for host only`)
        }
        // if no peer id, than store it in creator Ticket
        const creatorTicket = session.creatorTicket || { offer: []}
        creatorTicket.offer.push(...ticket)
        chunk.creatorTicket = creatorTicket
      } else {
        const peerTickets = session.ticketHouse[evt.peerID] || {}
        const clientTicket = peerTickets[clientID] || []
        clientTicket.push(...ticket)
        peerTickets[clientID] = clientTicket
        session.ticketHouse[peerID] = peerTickets
        chunk.ticketHouse = session.ticketHouse
      }
    })

    await db.collection('sessions').doc(session._id).update(chunk)

    return {
      code: 0
    }
  } catch (error) {
    return {
      code: 2,
      message: 'failed to query session info',
      extra: error
    }
  }
}