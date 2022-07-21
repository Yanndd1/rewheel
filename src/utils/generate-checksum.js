// generates checksum for a firmware file
// use this to update the firmware.json map
const crypto = require('crypto')
const checksums = require('../checksums.json')

const checksumForFirmware = (algorithm, buffer) => {
  const shaSum = crypto.createHash(algorithm)
  const view = new DataView(buffer, 0, 0xFBFF)
  shaSum.update(view)
  return shaSum.digest('hex')
}

const matchFirmwareRevision = (checksum) => {
  return checksums[checksum]
}

module.exports = { checksumForFirmware, matchFirmwareRevision }