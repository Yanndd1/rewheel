const fs = require('fs')
const { exit } = require('process')
const patches = require('./patches')
const args = process.argv.slice(2)

if (args.length < 1) {
  console.log('usage: node patcher [input file] [...patches]')
  exit(-1)
}

const inputFile = args[0]
const extension = inputFile.lastIndexOf('.')
const pathParts = [inputFile.substring(0, extension), inputFile.substring(extension)]
const outputPath = `${pathParts[0]}-patched.bin`
const requestedOperations = args.slice(1)

if (requestedOperations.length == 0) {
  console.warn('No patches requested. Exiting')
  exit(0)
}

const applyPatch = (firmware, patch) => {
  for (let offset = 0; offset < patch.data.length; offset++) {
    firmware.writeUInt8(patch.data[offset], patch.start + offset)
  }
  return firmware
}

try {
  let firmware = fs.readFileSync(inputFile)

  for (let operation of requestedOperations) {
    if (patches[operation] !== undefined) {
      const patch = patches[operation]

      console.log('applying', operation, '...')
      firmware = applyPatch(firmware, patch)
    }
    else
      console.warn('did not find operation', operation)
  }

  fs.writeFileSync(outputPath, firmware)
  console.log('complete. patched binary saved as', outputPath)
}
catch (err) {
  console.error(err)
  exit(-1)
}