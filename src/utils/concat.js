const fs = require('fs')
const args = process.argv.slice(2)

if (args.length < 4) {
  console.log('node concat [first file] [second file] [offset (hex)] [output file] [filler (hex)]')
  return -1
}

console.log('reading base file')
const firstFile = fs.readFileSync(args[0])

console.log('reading offset file')
const secondFile = fs.readFileSync(args[1])

const endFirstFile = firstFile.byteLength
const offset = parseInt(args[2], 16) || 0x8000000
const filler = args.length >= 5 ? parseInt(args[4], 16) : 0x00
console.log('end of first file', endFirstFile)
console.log('offset', offset)

// concat with addresses
const emptyData = new Uint8Array(offset - endFirstFile)
console.log('filling', emptyData.length, 'bytes of', filler, 'after', endFirstFile)
emptyData.fill(filler)

const buffers = [firstFile, emptyData, secondFile]
const output = Buffer.concat(buffers)

console.log('writing output file')
fs.writeFileSync(args[3], output)
console.log('done!')