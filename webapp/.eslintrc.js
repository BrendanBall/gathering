module.exports = {
  extends: ['standard', 'plugin:react/recommended'],
  plugins: [
    'standard',
    'promise',
    'react'
  ],
  env: {
    jest: true,
    node: true
  },
  globals: {
    fetch: true,
    RTCPeerConnection: true,
    RTCIceCandidate: true
  }
}
