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

#### `enableChargeAndRide`
Resolves Error 21 by removing the charger connected check. **Untested / experimental: use with caution.**

## Disclaimer
- Firmware is not provided for copyright reasons. You will need to dump the firmware from a Onewheel that you own and then flash it back. Instructions are provided [here](docs/DumpFirmware.md). **Warning: it's not for the faint of heart.**
- Firmware dumping process hasn't yet been tried for the GT. Since it uses an STM32F4, a different exploit needs to be written.

## Contributing
If you're able to dump the firmware from a Onewheel that you own, you can use Ghidra to dive into the assembly and even live debug against a working Pint, Pint X, or XR. This can aid in finding more patches for the firmware.

## Credits
- `datboig42069` on the Onewheel Discord for first verifying the firmware dump exploit from the research paper
