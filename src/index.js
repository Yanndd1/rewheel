const fs = require('fs')
const { exit, argv } = require('process')
const patches = require('./patches')
const args = require('minimist')(argv.slice(2))

if (args.help || (!args.f || args.firmware)) {
  console.log('\x1b[1musage: node patcher -f [input file] -o [output file] [...patches] [...args]\x1b[0m')
  console.log('\n\x1b[4mavailable patches\x1b[0m:')
  for (let patch of Object.keys(patches)) {
    console.log(`\x1b[32m${patch}\x1b[0m - ${patches[patch].description}`)
    const args = patches[patch].args
    if (args) {
      for (let arg of Object.keys(args)) {
        console.log(` - \x1b[33m${arg}\x1b[0m: ${args[arg]}`)
      }
    }
  }
  console.log('')
  exit(-1)
}

const inputFile = args.f || args.firmware
const extension = inputFile.lastIndexOf('.')
const pathParts = [inputFile.substring(0, extension), inputFile.substring(extension)]
const outputPath = args.o || args.output || `${pathParts[0]}-patched.bin`
const requestedOperations = args._.filter(operation => patches[operation] !== undefined)

if (requestedOperations.length == 0) {
  console.warn('no valid patches applied')
  exit(0)
}

const applyPatch = (firmware, patch) => {
  let modifications = []

  if (typeof patch.modifications === 'function') {
    modifications = patch.modifications(args)
  }
  else
    modifications = patch.modifications

  for (let mod of modifications) {
    for (let offset = 0; offset < mod.data.length; offset++) {
      firmware.writeUInt8(mod.data[offset], mod.start + offset)
    }
  }
  return firmware
}

try {
  let firmware = fs.readFileSync(inputFile)
  let appliedPatches = 0
  requestedOperations.forEach((operation, index) => {
    try {
      const patch = patches[operation]

      // look for required args for patch
      if (patch.args) {
        const missingArgs = []
        for (let arg of Object.keys(patch.args)) {
          if (!args[arg]) missingArgs.push(arg)
        }
        if (missingArgs.length > 0)
          throw `missing args \x1b[33m${missingArgs.join(',')}\x1b[37m`
      }

      // apply patch
      console.log(`applying patch (${index + 1}/${requestedOperations.length}) - \x1b[32m${operation}\x1b[37m`)
      firmware = applyPatch(firmware, patch)
      appliedPatches++
    }
    catch (err) {
      console.error(`\x1b[31merror applying patch (${index + 1}/${requestedOperations.length}) - \x1b[32m${operation}\x1b[37m: ${err}\x1b[0m`)
      console.error(err.stack)
    }
  })

  if (appliedPatches > 0) {
    fs.writeFileSync(outputPath, firmware)
    console.log('complete. patched binary saved as', outputPath)
  }
  else {
    console.warn('\x1b[33mno valid patches applied\x1b[0m')
  }
}
catch (err) {
  console.error(err)
  exit(-1)
}