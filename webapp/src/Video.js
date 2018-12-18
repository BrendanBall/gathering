import React from 'react'

export default function Video (args) {
  const setStream = video => {
    if (video) {
      video.srcObject = args.stream
    }
  }

  return (
    <div className="Video">
      <h3>{args.title}</h3>
      <video autoPlay playsInline ref={setStream}></video>
    </div>
  )
}
