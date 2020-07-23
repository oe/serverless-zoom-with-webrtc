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

export function getMediaStream(options: IGetMediaStreamOptions) {
  return navigator.mediaDevices.getUserMedia(options)
}


export function generateSessID() {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}