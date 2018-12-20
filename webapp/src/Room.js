import React, { useEffect, useReducer } from 'react'
import 'webrtc-adapter'
import gql from 'graphql-tag'
import client from './graphql'
import Video from './Video'

export default function Room (args) {
  const roomId = args.match.params.id
  const [state, dispatch] = useVideoCallReducer(roomId)

  return (
    <div className="Room">
      <h1>{roomId}</h1>
      <Video className="local" title="local" stream={state.localStream} />
      <Video className="remote" title="remote" stream={state.remoteStream} />
      <div>
        <button id="callButton" onClick={() => dispatch(startCall())}>Call</button>
        <button id="hangupButton" onClick={() => dispatch(stopCall(state))}>Hang Up</button>
      </div>
    </div>
  )
}

function stopCall (state) {
  state.localPeerConnection && state.localPeerConnection.close()
  state.remotePeerConnection && state.remotePeerConnection.close()
  return { type: 'stop' }
}

function startCall () {
  let localPeerConnection = new RTCPeerConnection()
  let remotePeerConnection = new RTCPeerConnection()
  return { type: 'start', localPeerConnection, remotePeerConnection }
}

function videoCallReducer (state, action) {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        status: 'started',
        localPeerConnection: action.localPeerConnection,
        remotePeerConnection: action.remotePeerConnection
      }
    case 'stop':
      return {
        ...state,
        status: 'stopped',
        localPeerConnection: null,
        remotePeerConnection: null
      }
    case 'gotLocalStream':
      return {
        ...state,
        localStream: action.stream
      }
    case 'gotRemoteStream':
      return {
        ...state,
        remoteStream: action.stream
      }
    default:
      return state
  }
}

function useVideoCallReducer (roomId) {
  const [state, dispatch] = useReducer(videoCallReducer, {
    status: 'pending',
    localPeerConnection: null,
    remotePeerConnection: null,
    localStream: null,
    remoteStream: null
  })
  const constraints = {
    audio: false,
    video: true
  }

  const offerOptions = {
    offerToReceiveVideo: 1
  }

  let { localPeerConnection, remotePeerConnection, localStream } = state

  // const iceServers = [{
  //   urls: 'stun:localhost:3478',
  //   username: 'user',
  //   credential: 'password'
  // }]

  useEffect(() => {
    const query = gql`subscription Signals($roomId: ID!) {
      signals(roomId: $roomId) {
        type
        userId
        roomId
        sdp
      }
    }`
    client.subscribe({
      query,
      variables: { roomId },
      fetchPolicy: 'no-cache'
    }).subscribe(signal => {
      console.log('got signal: ', signal)
    })
  }, [])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => dispatch({ type: 'gotLocalStream', stream }))
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
    dispatch({ type: 'gotRemoteStream', stream: event.stream })
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

  useEffect(() => {
    if (localPeerConnection && remotePeerConnection) {
      localPeerConnection.addEventListener('icecandidate', handleConnection)
      remotePeerConnection.addEventListener('icecandidate', handleConnection)
      remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream)

      localPeerConnection.addStream(localStream)
      localPeerConnection.createOffer(offerOptions)
        .then(createdOffer).catch(setSessionDescriptionError)
    }
    return () => stopCall(state)
  }, [localPeerConnection, remotePeerConnection])

  return [state, dispatch]
}
