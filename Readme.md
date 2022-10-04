# Rewheel

Firmware modification tools for the Onewheel Pint, Pint X and XR. Part of the R2Row ('Arturo') project.

## Requirements

- Node.js
- Yarn (optional)

## Firmware Patcher

### Usage

```
# npm
npm patcher -f [input file] -o [output file] [...patches]

# or

# yarn
yarn patcher -f [input file] -o [output file] [...patches]

```

### Available Patches

You'll find all patches you can use with the firmware patcher here. More to come soon.

#### `restoreData`

Restores serial number and mileage after the flash has been wiped (required to disable Read Out Protection)

##### Arguments

- `serialNumber` - (optional) 6 digit serial number preceded by OW (e.g. OW123456)
- `mileage` - (optional) lifetime odometer reading in miles

#### `removeBmsIdCheck`

Resolves Error 22 by removing the BMS serial ID check.

#### `convertPintModeBehaviorToXR`

Converts Pint riding mode behavior into the equivalent for the XR

#### `changeElevatedAngle`

Changes for forward and backward angles for Elevated mode

##### Arguments

- `elevatedAngle` - Angle above / below level for going forwards (up to +-32.00 degrees)
- `elevatedBackwardAngle` - (optional) Angle above / below level for going backwards. Forward angle is used if not provided.

#### `changeDeliriumSkylineAngle`

Changes the hold angle above level for Delirium / Skyline

##### Arguments

- `deliriumSkylineAngle` - Angle above / below level for going forwards (up to +-32.00 degrees)
- `deliriumSkylineBackwardAngle` - (optional) Angle above / below level for going backwards. Forward angle is used if not provided.

#### `enablePintCustomShaping`

Allows Pint to toggle into custom shaping (untested, probably still needs some work)

## Firmware Operations

### Dumping Firmware

- Firmware is not provided for copyright reasons. Instructions for dumping your Onewheel firmware are provided [here](docs/DumpFirmware.md). **Warning: it's not for the faint of heart.**

### Flashing Firmware

- Instructions to flash your Onewheel are located [here](docs/FlashFirmware.md). Thankfully, this is significantly easier than dumping the firmware to begin with.

### Generate Checksum for Firmware

```
# npm
npm run checksum:generate -- -i [input file]

# or

# yarn
yarn checksum -i [input file]
```

The patcher uses the checksum of the firmware to set the offsets of each firmware patch.

If your firmware doesn't match a known checksum, [open an issue](https://github.com/outlandnish/rewheel/issues/new?assignees=&labels=new-firmware-revision&template=support-new-firmware-revision.md&title=Add+support+for+firmware+%3Crevision%3E) for it. That way, we can find the offsets for that firmware revision and support more firmware.

## Disclaimer

- Firmware dumping process hasn't yet been tried for the GT. Since it uses an STM32F4, a different exploit needs to be written.
- This project is not affiliated with or endorsed by Future Motion. Proceed at your own risk - this will void your warranty.

## Contributing

If you're able to dump the firmware from a Onewheel that you own, you can use Ghidra to dive into the assembly and even live debug against a working Pint, Pint X, or XR. This can aid in finding more patches for the firmware.

## Credits

- `datboig42069` on the Onewheel Discord for first verifying the firmware dump exploit from the research paper
