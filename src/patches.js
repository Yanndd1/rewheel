// known to work on 5046. Hasn't been checked for other versions
const nop = [0x00, 0xBF]
const padNops = (data, count) => count == 0 ? data : padNops(data.concat(nop), count - 1)

const removeBmsIdCheck = {
  description: 'Allows you to use any BMS (disables Error 22 for incorrect serial ID)',
  modifications: [
    {
      start: {
        5046: 0xED26
      },
      data: padNops([0x10, 0x45, 0x08, 0x45], 11)
    }
  ]
}

const convertRedwoodToSequoia = {
  description: `Gives Pint's Redwood the characteristics of XR's Sequoia`,
  modifications: [
    {
      start: {
        5046: 0xA912
      },
      data: [0x33, 0x40]
    }
  ]
}

const convertSkylineToDelirium = {
  description: `Gives Pint's Skyline the characteristics of XR's Delirium`,
  modifications: [
    {
      start: {
        5046: 0xAAFE
      },
      data: [0x0A]
    },
    {
      start: {
        5046: 0xAAE2
      },
      data: [0x88, 0x30]
    },
    {
      start: {
        5046: 0xAAe6
      },
      data: [0x84, 0x71]
    },
    {
      start: {
        5046: 0xAB36
      },
      data: [0x0A]
    }
  ]
}

const convertPintModesToXRModes = {
  description: `Gives Pint's Pacific and Elevated the characteristics of XR's Mission and Elevated`,
  modifications: [
    {
      start: {
        5046: 0xA9A6
      },
      data: [0x0A]
    }
  ]
}

const increasePintAggressiveness = {
  descriptoin: `Gives the Pint the base aggressiveness of the XR (maybe top speed too?)`,
  modifications: [
    {
      start: {
        5046: 0xC3F6
      },
      data: [0xA4, 0x61]
    },
    {
      start: {
        5046: 0xC3FA
      },
      data: [0x61, 0x72]
    }
  ]
}

const restoreData = {
  description: `Restores the serial number and mileage of the Onewheel after flash has been wiped`,
  args: {
    serialNumber: 'The new serial number in the format: OW123456',
    mileage: 'The mileage that the board has accumulated'
  },
  modifications: ({ serialNumber, mileage }) => [...restoreSerialNumber(serialNumber), ...restoreMileage(mileage)]
}

/*
divide number % 0x10000 (65536) = scalar => store at 0x0800fc30
subtract 0x10000 * scalar from serial number
store remainder at uint16 in LE format at 0x0800fc0a
*/
const restoreSerialNumber = (serialNumber) => {
  let normalized = serialNumber.replace('OW', '')
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
      start: {
        5046: 0xFC30
      },
      data: [scalar]
    },
    {
      start: {
        5046: 0xFC0A
      },
      data: Array.from(buffer)
    }
  ]
}

/*
(not the complete mileage solution but practically correct up to 2,372,910 miles)
multiple mileage by 0x712
store at 0x0800fc0c as uint32 in LE
*/
const restoreMileage = (mileage) => {
  const buffer = new Uint8Array(4)
  const view = new DataView(buffer.buffer, 0, 4)
  view.setUint32(0, mileage * 0x712, true)
  return [
    {
      start: {
        5046: 0xFC0C
      },
      data: Array.from(buffer)
    }
  ]
}

module.exports = {
  removeBmsIdCheck,
  convertRedwoodToSequoia,
  convertSkylineToDelirium,
  convertPintModesToXRModes,
  increasePintAggressiveness,
  restoreData
}