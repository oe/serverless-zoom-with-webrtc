import React, { useRef, useEffect } from 'react'
import * as utils from '../utils'

export default function VideoWindow(props) {
  const videoRef = useRef(null)
    
  useEffect(() => {
    const updateStream = (stream) =>{
      const dom = videoRef.current
      if (!dom) return
      // 自己则mute
      dom.muted = !props.peer
      if ('srcObject' in dom) {
        dom.srcObject = stream
        dom.onloadedmetadata = function() {
          dom.play();
        };
        return
      }
      dom.src = URL.createObjectURL(stream)
      dom.play()
    }

    if (props.peer) {
      props.peer.on('stream', updateStream)
      return
    }
    utils.getMediaStream().then(updateStream)
    
    return () => {
      if (!props.peer) return
      props.peer.off('stream', updateStream)
    }
  }, [props.peer])

  return (
    <video ref={videoRef} controls={!!props.peer} width="640" height="480"></video>
  )
}
