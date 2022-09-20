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
  description: `Gives the Pint the base aggressiveness of the XR (maybe top speed too?)`,
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

const enableCustomShaping = {
  description: `Allows the Pint to toggle in Custom Shaping mode`,
  modifications: [
    {
      start: {
        5046: 0x4A34
      },
      data: [0x09]
    },
    {
      start: {
        5046: 0x49FE
      },
      data: [0x09]
    }
  ]
}

// const setDefaultAngleOffset = {
//   description: `Applies an angle offset to all modes except Elevated, Delirium / Skyline, and Custom Shaping`,
//   args: {
//     offset: 'Angle offset (degrees). Range: 0 - 2.55'
//   },
//   modifications: ({ offset }) => {
//     // TODO: figure out how to get the full range of a short working for this
//     if (offset < 0 || offset > 45)
//       throw 'invalid offset angle. limits: 0 <= angle <= 45'

//     const scaledOffset = Math.round(offset * 100)

//     return [
//       {
//         start: {
//           5046: 0xAB9E
//         },
//         data: Array.from(buffer)
//       }
//     ]
//   }
// }

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

  console.debug(' - \x1b[33mserial number\x1b[0m:', normalized)

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
  console.debug(' - \x1b[33mmileage\x1b[0m:', mileage)
  return [
    {
      start: {
        5046: 0xFC0C
      },
      data: Array.from(buffer)
    }
  ]
}

/*
calculate angles:
(angle * 100) + 36000 / 256 => store in first byte
-36000 - (angle * 100) % 256 => store in second byte
*/

const changeElevatedAngle = {
  description: 'Test to change angle of elevated to 5 degrees instead of 3',
  args: {
    forwardAngle: 'Angle of lift for going forwards (positive values only to a max of 20 with up to hundredth precision)',
    backwardAngle: 'Angle of lift for going backwards (positive values only to a max of 20 with up to hundredth precision)'
  },
  modifications: ({ forwardAngle, backwardAngle }) => {
    forwardAngle = parseFloat(forwardAngle).toFixed(2)
    backwardAngle = parseFloat(backwardAngle).toFixed(2)

    console.log(' - \x1b[33mforward angle\x1b[0m:', forwardAngle)
    console.log(' - \x1b[33mbackward angle\x1b[0m:', backwardAngle)

    if (forwardAngle < 0 || forwardAngle > 20 || isNaN(forwardAngle))
      throw `invalid forward angle: ${forwardAngle}. Must be between 0 and 20`

    if (backwardAngle < 0 || backwardAngle > 20 || isNaN(backwardAngle))
      throw `invalid backward angle: ${backwardAngle}. Must be between 0 and 20`

    const forwardAngleNormalized = (forwardAngle * 100) + 36000
    const backwardAngleNormalized = 36000 - (forwardAngle * 100)

    const forwardAngleScalar = Math.floor(forwardAngleNormalized / 256)
    const backwardAngleScalar = Math.floor(backwardAngleNormalized / 256)

    const forwardAngleRemainder = forwardAngleNormalized % 256
    const backwardAngleRemainder = backwardAngleNormalized % 256

    return [
      {
        start: {
          5046: 0x8522
        },
        data: forwardAngleScalar
      },
      {
        start: {
          5046: 0x8526
        },
        data: forwardAngleRemainder
      },
      {
        start: {
          5046: 0x84FA
        },
        data: backwardAngleScalar
      },
      {
        start: {
          5046: 0x84FC
        },
        data: backwardAngleRemainder
      }
    ]
  }
}

module.exports = {
  removeBmsIdCheck,
  restoreData,
  convertRedwoodToSequoia,
  convertSkylineToDelirium,
  convertPintModesToXRModes,
  increasePintAggressiveness,
  enableCustomShaping,
  changeElevatedAngle
}