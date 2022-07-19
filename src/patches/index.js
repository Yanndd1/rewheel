// known to work on 5046. Hasn't been checked for other versions

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
      data: [0xFF]
    },
    {
      start: 0xAAE2,
      data: [0x88, 0x30]
    },
    {
      start: 0xAAe6,
      data: [0x84, 0x71]
    },
    {
      start: 0xAB3A,
      data: [0xC0]
    },
    {
      start: 0xAB3E,
      data: [0x63]
    }
  ]
}

const convertPintModesToXRModes = {
  description: `Gives Pint's Pacific and Elevated the characteristics of XR's Mission and Elevated`,
  modifications: [
    {
      start: 0xA9A6,
      data: [0xFF]
    },
    {
      start: 0xA9AC,
      data: [0x34]
    }
  ]
}

module.exports = {
  removeBmsIdCheck,
  convertRedwoodToSequoia,
  convertSkylineToDelirium,
  convertPintModesToXRModes
}