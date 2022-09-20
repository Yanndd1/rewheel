const fs = require('fs')
const { exit, argv } = require('process')
const args = require('minimist')(argv.slice(2))
const { checksumForFirmware, matchFirmwareRevision } = require('./utils/generate-checksum')

if (args.help || (!args.i || args.input)) {
  console.log('\x1b[1musage: yarn checksum -i [input file]\x1b[0m')
  exit(0)
}

const inputFile = args.i || args.input

try {
  const firmware = fs.readFileSync(inputFile)
  const checksum = checksumForFirmware('sha1', firmware.buffer)
  const firmwareRevision = matchFirmwareRevision(checksum)

  if (firmwareRevision) {
    console.log('firmware match:', firmwareRevision)
    exit(0)
  }
  else {
    console.log('new firmware revision', checksum)
  }
}
catch (err) {
  console.error(err)
  exit(-1)
}