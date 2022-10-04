// generates checksum for a firmware file
// use this to update the firmware.json map
const crypto = require('crypto')
const checksums = require('../checksums.json')

const checksumForFirmware = (algorithm, buffer) => {
  const shaSum = crypto.createHash(algorithm)
  // from start of main function to before flash preferences
  const view = new DataView(buffer, 0x3000, 0xFBFF)
  shaSum.update(view)

  return shaSum.digest('hex')
}

const matchFirmwareRevision = (checksum) => {
  return checksums[checksum]
}

module.exports = { checksumForFirmware, matchFirmwareRevision }