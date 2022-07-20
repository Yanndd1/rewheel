// known to work on 5046. Hasn't been checked for other versions

const { Console } = require("console")

const nop = [0x00, 0xBF]
const padNops = (data, count) => count == 0 ? data : padNops(data.concat(nop), count - 1)

const removeBmsIdCheck = {
  description: 'Allows you to use any BMS (disables Error 22 for incorrect serial ID)',
  modifications: [
    {
      start: 0xED26,
      data: padNops([0x10, 0x45, 0x08, 0x45], 11)
    }
  ]
}

const convertRedwoodToSequoia = {
  description: `Gives Pint's Redwood the characteristics of XR's Sequoia`,
  modifications: [
    {
      start: 0xA912,
      data: [0x33, 0x40]
    }
  ]
}

const convertSkylineToDelirium = {
  description: `Gives Pint's Skyline the characteristics of XR's Delirium`,
  modifications: [
    {
      start: 0xAAFE,
      data: [0x0A]
    },
    {
      start: 0xAAE2,
      data: [0x88, 0x30]
    },
    {
      start: 0xAAe6,
      data: [0x84, 0x67]
    },
    {
      start: 0xAB3A,
      data: [0xC0]
    },
    {
      start: 0xAB3E,
      data: [0x63]
    },
    {
      start: 0xAB36,
      data: [0x0A]
    }
  ]
}

const convertPintModesToXRModes = {
  description: `Gives Pint's Pacific and Elevated the characteristics of XR's Mission and Elevated`,
  modifications: [
    {
      start: 0xA9A6,
      data: [0x0A]
    }
  ]
}

const setSerialNumber = {
  description: `Sets the serial number of the Onewheel`,
  args: { serialNumber: 'The new serial number in the format: OW123456' },
  modifications: (args) => {
    let normalized = args.serialNumber.replace('OW', '')
    if (normalized.length > 6)
      throw 'invalid serial number - must be 6 digit number optionally preceded by OW'

    normalized = parseInt(normalized)
    const scalar = Math.floor(normalized / 0x10000)
    const remainder = normalized % (0x10000 * scalar)
    const buffer = new Uint8Array(2)
    const view = new DataView(buffer.buffer, 0, 2)
    view.setUint16(0, remainder, true)
    return [
      {
        start: 0xFC30,
        data: [scalar]
      },
      {
        start: 0xFC0A,
        data: Array.from(buffer)
      }
    ]
  }
}

module.exports = {
  removeBmsIdCheck,
  convertRedwoodToSequoia,
  convertSkylineToDelirium,
  convertPintModesToXRModes,
  setSerialNumber
}