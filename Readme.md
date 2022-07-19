# Rewheel
Firmware modification tools for the Onewheel Pint, Pint X and XR. Part of the R2Row ('Arturo') project.

## Requirements
- Node.js

## Firmware Patcher
### Usage
```
node src/patcher [input file] [...patches]
```

### Available Patches
You'll find all patches you can use with the firmware patcher here. More to come soon.

#### `removeBmsIdCheck`
Resolves Error 22 by removing the BMS serial ID check. Tested against 5046 on a Pint.

#### `convertRedwoodToSequoia`
Converts the Pint's Redwood riding mode into the XR's Sequoia riding mode.

#### `convertSkylineToDelirium`
Converts the Pint's Skyline riding mode into the XR's Delirium riding mode.

#### `convertPintModesToXRModes`
Converts the Pint's Pacific and Elevated riding modes into the XR's Mission and Elevated riding modes.  

## Reading and Writing Firmware

### Dumping Firmware
- Firmware is not provided for copyright reasons. Instructions for dumping your Onewheel firmware are provided [here](docs/DumpFirmware.md). **Warning: it's not for the faint of heart.**

### Flashing Firmware
- Instructions to flash your Onewheel are located [here](docs/FlashFirmware.md). Thankfully, this is significantly easier than dumping the firmware to begin with.

## Disclaimer
- Firmware dumping process hasn't yet been tried for the GT. Since it uses an STM32F4, a different exploit needs to be written.
- This project is not affiliated with or endorsed by Future Motion. Proceed at your own risk - this will void your warranty.

## Contributing
If you're able to dump the firmware from a Onewheel that you own, you can use Ghidra to dive into the assembly and even live debug against a working Pint, Pint X, or XR. This can aid in finding more patches for the firmware.

## Credits
- `datboig42069` on the Onewheel Discord for first verifying the firmware dump exploit from the research paper
