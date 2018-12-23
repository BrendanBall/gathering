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
    RTCIceCandidate: true,
    MediaStream: true
  },
  rules: {
    'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }]
  }
}
