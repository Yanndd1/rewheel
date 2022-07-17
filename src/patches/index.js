// known to work on 5046. Hasn't been checked for other versions

const padNops = (count) => {
  const nops = Array(count * 2)
  for (let i = 0; i < count; i++) {
    nops.push(0x00)
    nops.push(0xBF)
  }
  return nops
}

const removeBmsIdCheck = {
  description: 'Allows you to use any BMS (disables Error 22 for incorrect serial ID)',
  start: 0xED26,
  data: [0x10, 0x45, 0x08, 0x45, ...padNops(11)]
}

const enableChargeAndRide = {
  description: 'Allows you to plug in a charger and keep riding (untested / experimental)',
  start: 0x4338,
  data: [...padNops(11)]
}

module.exports = {
  removeBmsIdCheck,
  enableChargeAndRide
}