
export function isSupportRTC() {
  return !!navigator.mediaDevices
}

export function hasMediaPermission() {
  if (!navigator.permissions) return Promise.resolve(false)
  return Promise.all([
    navigator.permissions.query({name: 'microphone'}),
    navigator.permissions.query({name: 'camera'})
  ]).then(permissions => {
    return permissions.some(p => p.state === 'granted')
  })
  .catch(e => {
    console.log('failed to check permission', e)
    return false
  })
}

export interface IGetMediaStreamOptions {
  audio: boolean
  video: boolean
}

type IMediaStream = MediaStream | undefined
interface IStreamChange {
  oldValue: IMediaStream
  newValue: MediaStream
}
type IStreamChangeCb = (e: IStreamChange) => void
const STREAM_CHANGE_CBS: IStreamChangeCb[] = []

export function listenStreamChange(cb: IStreamChangeCb) {
  if (STREAM_CHANGE_CBS.includes(cb)) return
  STREAM_CHANGE_CBS.push(cb)
}

function runStreamChangeCbs(evt: IStreamChange) {
  STREAM_CHANGE_CBS.forEach(cb => cb(evt))
}

let cachedMediaStream: IMediaStream
let cachedMediaOptions: IGetMediaStreamOptions | undefined

export async function getMediaStream(options: IGetMediaStreamOptions) {
  if (cachedMediaOptions &&
    cachedMediaOptions.audio === options.audio &&
    cachedMediaOptions.video === options.video) {
    
    return Promise.resolve(cachedMediaStream!)
  }
  
  const stream = await navigator.mediaDevices.getUserMedia(options)
  
  runStreamChangeCbs({oldValue: cachedMediaStream, newValue: stream})
  revokeMediaStream(cachedMediaStream)
  cachedMediaStream = stream
  cachedMediaOptions = options
  
  return cachedMediaStream
}

export function revokeMediaStream(stream?: MediaStream) {
  if (!stream) return
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  })
}

export function generateSessID() {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const CACHED_KEY = 'ONLINE-MEETING-CLIENT-ID'
export function getClientID() {
  let id = localStorage.getItem(CACHED_KEY)
  if (id) return id
  id = 'client-' + generateSessID()
  localStorage.setItem(CACHED_KEY, id)
  return id
}

export async function checkMediaPermission() {
  // if (navigator.permissions) {
  //   const result = await Promise.all([
  //     navigator.permissions.query({name: 'camera'}),
  //     navigator.permissions.query({name: 'microphone'})
  //   ])
  //   if (result[0].state !== 'prompt') {
  //     return result[0].state === 'granted' && result[1].state === 'granted'
  //   }
  // }
  const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
  const result = stream.getAudioTracks().length && stream.getVideoTracks().length
  revokeMediaStream(stream)
  return result
}