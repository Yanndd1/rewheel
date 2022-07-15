const fs = require('fs')
const readline = require('readline')
const args = process.argv.slice(2)

const inputFile = args[0]
const extension = inputFile.lastIndexOf('.')
const pathParts = [inputFile.substring(0, extension), inputFile.substring(extension)]
const outputPath = `${pathParts[0]}-le${pathParts[1]}`

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  terminal: false
})

const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' })

const convertToLEWord = (beWord) => {
  if (!beWord)
    return null

  return beWord.match(/.{1,2}/g).reverse().join('')
}

rl.on('line', line => {
  const words = line.split(' ')
  const converted = words.map(word => convertToLEWord(word)).join(' ')
  writeStream.write(converted)
  writeStream.write('\n')
})

rl.on('close', _ => {
  writeStream.close()
})