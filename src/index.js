const fs = require('fs')
const { exit, argv } = require('process')
const patches = require('./patches')
const { checksumForFirmware, matchFirmwareRevision } = require('./utils/generate-checksum')
const args = require('minimist')(argv.slice(2))

console.log('\x1b[1mOnewheel Firmware Patcher\x1b[0m')

const printUsage = () => {
  console.log('\x1b[1mUsage: yarn patcher -i [input file] -o [output file] [...patches] --[patch args]\x1b[0m')
  console.log('\nAvailable Patches:')
  // list out all available patches
  for (let patch of Object.keys(patches)) {
    console.log(`\x1b[32m  ${patch}\x1b[0m - ${patches[patch].description}`)
    const args = patches[patch].args

    // list out args
    if (args) {
      for (let arg of Object.keys(args)) {
        console.log(`   - \x1b[33m${arg}\x1b[0m:${args[arg].required ? '' : ' \x1b[2m(optional)\x1b[0m'} ${args[arg].description}`)
      }
    }
  }
  console.log('')
}

const applyPatch = (firmware, revision, patch) => {
  let modifications = []

  if (typeof patch.modifications === 'function') {
    modifications = patch.modifications(args)
  }
  else
    modifications = patch.modifications

  for (let mod of modifications) {
    for (let offset = 0; offset < mod.data.length; offset++) {
      firmware.writeUInt8(mod.data[offset], mod.start[revision] + offset)
    }
  }

  return firmware
}

if (args.help || (!args.i || args.input)) {
  printUsage()
  exit(0)
}

const inputFile = args.i || args.input
const extension = inputFile.lastIndexOf('.')
const pathParts = [inputFile.substring(0, extension), inputFile.substring(extension)]
const outputPath = args.o || args.output || `${pathParts[0]}-patched.bin`
const requestedOperations = args._.filter(operation => patches[operation] !== undefined)

if (requestedOperations.length == 0) {
  console.warn('no valid patches applied')
  exit(0)
}

try {
  let firmware = fs.readFileSync(inputFile)
  const checksum = checksumForFirmware('sha1', firmware.buffer)
  const firmwareRevision = matchFirmwareRevision(checksum)

  if (firmwareRevision === 'undefined')
    throw `firmware checksum ${checksum} doesn't match a known revision: `

  console.log('firmware match:', firmwareRevision)

  let appliedPatches = 0
  requestedOperations.forEach((operation, index) => {
    try {
      const patch = patches[operation]

      // look for required args for patch
      if (patch.args) {
        const missingArgs = []
        for (let arg of Object.keys(patch.args)) {
          if (!patch.args[arg] && patch.args[arg].required) missingArgs.push(arg)
        }
        if (missingArgs.length > 0)
          throw `missing required args \x1b[33m${missingArgs.join(',')}\x1b[37m`
      }

      // apply patch
      console.log(`applying patch (${index + 1}/${requestedOperations.length}) - \x1b[32m${operation}\x1b[37m`)
      firmware = applyPatch(firmware, firmwareRevision, patch)
      appliedPatches++
    }
    catch (err) {
      console.error(`\x1b[31merror applying patch (${index + 1}/${requestedOperations.length}) - \x1b[32m${operation}\x1b[37m: ${err}\x1b[0m`)
      console.error(err.stack)
    }
  })

  if (appliedPatches > 0) {
    fs.writeFileSync(outputPath, firmware)
    console.log('\x1b[1mcomplete. patched binary saved as', outputPath, '\x1b[0m')
  }
  else {
    console.warn('\x1b[33mno valid patches applied\x1b[0m')
  }
}
catch (err) {
  console.error(err)
  exit(-1)
}