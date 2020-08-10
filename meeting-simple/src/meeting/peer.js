import Peer from 'simple-peer'
import * as utils from './utils'
import * as api from './api'

export async function createPeer(initiator, meetingId) {
  const peer = new Peer({initiator})
  const stream = await utils.getMediaStream()
  peer.addStream(stream)

  peer.on('signal', (e) => {
    console.log('[peer event]signal', e)
    updateTicket(e, initiator, meetingId)
  })
  peer.on('connect', (e) => {
    console.log('[peer event]connect', e)
  })
  peer.on('data', (e) => {
    console.log('[peer event]data', e)
  })
  peer.on('stream', (e) => {
    console.log('[peer event]stream', e)
  })
  peer.on('track', (e) => {
    console.log('[peer event]track', e)
  })
  peer.on('close', () => {
    console.log('[peer event]close')
  })
  peer.on('error', (e) => {
    console.log('[peer event]error', e)
  })
  return peer
}

let cachedTickets = []
let tid = 0

function updateTicket(signal, isInitiator, meetingId) {
  cachedTickets.push(signal)
  clearTimeout(tid)
  tid = setTimeout(async () => {
    const tickets = cachedTickets.splice(0)
    try {
      const result = await api.updateTicket({
        meetingId,
        tickets,
        type: isInitiator ? 'offer' : 'answer'
      })
      console.warn('[updateTicket] success', result)
    } catch (error) {
      console.warn('[updateTicket] failed', error)
    }
  }, 100);
}

export function signalTickets(peer, tickets) {
  tickets.forEach(item => {
    peer.signal(item)
  })
}