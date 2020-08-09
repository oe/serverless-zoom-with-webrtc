/** 检查是否支持 WebRTC */
export function isSupportRTC() {
  return !!navigator.mediaDevices
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

export function revokeMediaStream(stream) {
  if (!stream) return
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  })
}

let cachedMediaStream = null

export async function getMediaStream() {
  if (cachedMediaStream) {
    return Promise.resolve(cachedMediaStream)
  }
  const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
  
  revokeMediaStream(cachedMediaStream)
  cachedMediaStream = stream
  
  return cachedMediaStream
}