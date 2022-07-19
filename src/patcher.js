const fs = require('fs')
const { exit } = require('process')
const patches = require('./patches')
const args = process.argv.slice(2)

if (args.length < 1) {
  console.log('\x1b[1musage: node patcher [input file] [...patches]\x1b[0m')
  console.log('\n\x1b[4mavailable patches\x1b[0m:')
  for (let patch of Object.keys(patches)) {
    console.log(`\x1b[32m${patch}\x1b[0m: ${patches[patch].description}`)
  }
  console.log('')
  exit(-1)
}

const inputFile = args[0]
const extension = inputFile.lastIndexOf('.')
const pathParts = [inputFile.substring(0, extension), inputFile.substring(extension)]
const outputPath = `${pathParts[0]}-patched.bin`
const requestedOperations = args.slice(1).filter(operation => patches[operation] !== undefined)

if (requestedOperations.length == 0) {
  console.warn('No valid patches requested. Exiting')
  exit(0)
}

const applyPatch = (firmware, patch) => {
  for (let mod of patch.modifications) {
    for (let offset = 0; offset < mod.data.length; offset++) {
      firmware.writeUInt8(mod.data[offset], mod.start + offset)
    }
  }
  return firmware
}

try {
  let firmware = fs.readFileSync(inputFile)

  requestedOperations.forEach((operation, index) => {
    const patch = patches[operation]

    console.log(`applying patch (${index + 1}/${requestedOperations.length}) - ${operation}`)
    firmware = applyPatch(firmware, patch)
  })

  fs.writeFileSync(outputPath, firmware)
  console.log('complete. patched binary saved as', outputPath)
}
catch (err) {
  console.error(err)
  exit(-1)
}