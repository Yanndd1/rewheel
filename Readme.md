# Rewheel
Firmware modification tools for the Onewheel Pint, Pint X and XR

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
Resolves Error 22 but removing the BMS serial ID. Tested against 5046.

## Disclaimer
- Firmware is not provided for copyright reasons. You will need to dump the firmware from your Onewheel and then flash it back. Instructions are provided [here](docs/DumpFirmware.md). **Warning: it's not for the faint of heart.**