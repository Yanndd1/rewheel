const nop = [0x00, 0xBF]
const padNops = (data, count) => count == 0 ? data : padNops(data.concat(nop), count - 1)

const printArgs = (args) => {
  for (let arg of Object.keys(args)) {
    console.debug(` - \x1b[33m${arg}\x1b[0m: ${args[arg]}`)
  }
}

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
    serialNumber: {
      description: 'The new serial number in the format: OW123456',
      required: false
    },
    mileage: {
      description: 'The mileage that the board has accumulated',
      required: false
    }
  },
  modifications: ({ serialNumber, mileage }) => [...restoreSerialNumber(serialNumber), ...restoreMileage(mileage)]
}

/*
divide number % 0x10000 (65536) = scalar => store at 0x0800fc30
subtract 0x10000 * scalar from serial number
store remainder at uint16 in LE format at 0x0800fc0a
*/
const restoreSerialNumber = (serialNumber) => {
  if (!serialNumber)
    return []

  if (typeof serialNumber !== 'string' || serialNumber.length === 0)
    throw 'invalid data as serial number. must be a string of the format OW123456 or 123456'

  let normalized = serialNumber.replace('OW', '')
  if (normalized.length > 6)
    throw 'invalid serial number - must be 6 digit number optionally preceded by OW'

  printArgs({ serialNumber: normalized })

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
  if (!mileage)
    return []

  if (typeof mileage !== 'number' || isNaN(mileage))
    throw 'invalid mileage provided'

  const buffer = new Uint8Array(4)
  const view = new DataView(buffer.buffer, 0, 4)
  view.setUint32(0, mileage * 0x712, true)

  printArgs({ mileage })

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
(angle * 100) + 36000 % 256 => store in second byte
*/

const getAngleScalarAndRemainder = (angle) => {
  const normalized = (angle * 100) + 36000
  const scalar = Math.floor(normalized / 256) - 0x80  // - 0x80 hack. works for now but need to figure out actual math
  const remainder = normalized % 256
  return { scalar, remainder }
}

const getAngleAndBackwardAngle = (angle, backwardAngle) => {
  angle = parseFloat(angle).toFixed(2)

  if (backwardAngle)
    backwardAngle = parseFloat(backwardAngle).toFixed(2)
  else
    backwardAngle = angle

  printArgs({ angle, backwardAngle })

  if (angle < -32.00 || angle > 32.00 || isNaN(angle))
    throw `invalid angle: ${angle}. Must be between -32 and 32`

  if (backwardAngle < -32.00 || backwardAngle > 32.00 || isNaN(backwardAngle))
    throw `invalid backward angle: ${backwardAngle}. Must be between -32 and 32`

  angle = getAngleScalarAndRemainder(angle)
  backwardAngle = getAngleScalarAndRemainder(backwardAngle, true)

  return { angle, backwardAngle }
}

const changeElevatedAngle = {
  description: 'Changes the hold angle above level for Elevated',
  args: {
    elevatedAngle: {
      description: 'Angle above / below level for going forwards (up to +-32.00 degrees)',
      required: true
    },
    elevatedBackwardAngle: {
      description: 'Angle above / below level for going backwards. Forward angle is used if not provided.',
      required: false
    }
  },
  modifications: ({ elevatedAngle, elevatedBackwardAngle }) => {
    const {
      angle: { scalar: forwardAngleScalar, remainder: forwardAngleRemainder },
      backwardAngle: { scalar: backwardAngleScalar, remainder: backwardAngleRemainder }
    } = getAngleAndBackwardAngle(elevatedAngle, elevatedBackwardAngle)

    return [
      {
        start: {
          5046: 0x8524
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

const changeDeliriumSkylineAngle = {
  description: 'Changes the hold angle above level for Delirium / Skyline',
  args: {
    deliriumSkylineAngle: {
      description: 'Angle above level for going forwards (up to 32.00 degrees)',
      required: true
    },
    deliriumSkylineBackwardAngle: {
      description: 'Angle above level for going backwards. Forward angle is used if not provided.',
      required: false
    }
  },
  modifications: ({ deliriumSkylineAngle, deliriumSkylineBackwardAngle }) => {
    const {
      angle: { scalar: forwardAngleScalar, remainder: forwardAngleRemainder },
      backwardAngle: { scalar: backwardAngleScalar, remainder: backwardAngleRemainder }
    } = getAngleAndBackwardAngle(deliriumSkylineAngle, deliriumSkylineBackwardAngle)

    return [
      {
        start: {
          5046: 0x855C
        },
        data: forwardAngleScalar
      },
      {
        start: {
          5046: 0x855E
        },
        data: forwardAngleRemainder
      },
      {
        start: {
          5046: 0x856E
        },
        data: backwardAngleScalar
      },
      {
        start: {
          5046: 0x8570
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
  changeElevatedAngle,
  changeDeliriumSkylineAngle,
}