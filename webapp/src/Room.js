import React, { useState, useEffect } from 'react'
import Video from './Video'
import 'webrtc-adapter'

export default function Room (args) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [localPeerConnection, setLocalPeerConnection] = useState(null)
  const [remotePeerConnection, setRemotePeerConnection] = useState(null)
  const constraints = {
    audio: false,
    video: true
  }

  const offerOptions = {
    offerToReceiveVideo: 1
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(setLocalStream)
  }, [])

  function getOtherPeer (peerConnection) {
    return (peerConnection === localPeerConnection)
      ? remotePeerConnection : localPeerConnection
  }

  function handleConnectionFailure (peerConnection, error) {
    console.log(`${getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
          `${error.toString()}.`)
  }

  function handleConnection (event) {
    const peerConnection = event.target
    const iceCandidate = event.candidate

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate)
      const otherPeer = getOtherPeer(peerConnection)

      otherPeer.addIceCandidate(newIceCandidate)
        .catch((error) => { handleConnectionFailure(peerConnection, error) })
    }
  }

  function getPeerName (peerConnection) {
    return (peerConnection === localPeerConnection)
      ? 'localPeerConnection' : 'remotePeerConnection'
  }

  function gotRemoteMediaStream (event) {
    setRemoteStream(event.stream)
  }

  function setSessionDescriptionError (error) {
    console.log(`Failed to create session description: ${error.toString()}.`)
  }

  function createdAnswer (description) {
    remotePeerConnection.setLocalDescription(description)
      .catch(setSessionDescriptionError)

    localPeerConnection.setRemoteDescription(description)
      .catch(setSessionDescriptionError)
  }

  function createdOffer (description) {
    localPeerConnection.setLocalDescription(description)
      .catch(setSessionDescriptionError)

    remotePeerConnection.setRemoteDescription(description)
      .catch(setSessionDescriptionError)

    remotePeerConnection.createAnswer()
      .then(createdAnswer)
      .catch(setSessionDescriptionError)
  }

  function handleCall () {
    setLocalPeerConnection(new RTCPeerConnection())
    setRemotePeerConnection(new RTCPeerConnection())
  }

  useEffect(() => {
    if (localPeerConnection && remotePeerConnection) {
      localPeerConnection.addEventListener('icecandidate', handleConnection)

      remotePeerConnection.addEventListener('icecandidate', handleConnection)
      remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream)

      localPeerConnection.addStream(localStream)
      localPeerConnection.createOffer(offerOptions)
        .then(createdOffer).catch(setSessionDescriptionError)
    }
  }, [localPeerConnection, remotePeerConnection])

  function handleHangup () {
    localPeerConnection.close()
    remotePeerConnection.close()
  }

  return (
    <div className="Room">
      <h1>{args.match.params.id}</h1>
      <Video className="local" title="local" stream={localStream} />
      <Video className="remote" title="remote" stream={remoteStream} />
      <div>
        <button id="callButton" onClick={handleCall}>Call</button>
        <button id="hangupButton" onClick={handleHangup}>Hang Up</button>
      </div>
    </div>
  )
}
