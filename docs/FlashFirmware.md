# Instructions to Flash Firmware

Happily, flashing patched firmware is significantly simpler than dumping firmware from the controller.

## Before Flashing
Record your Onewheel controller ID and mileage. We'll need to patch these back into the flash memory.

To do so:

1. Solder the STM32 back to the Pint / XR. Make sure you match the original orientation of the chip denoted by the white dot on the STM32. Do continuity checks to check for shorts. Power up and verify the Onewheel still boots up. Power off the Onewheel when complete.
2. Look for a set of 8 pads on the bottom of the Pint. You'll need to clean the conformal coating off of these pins.
3. From the top of the via diagonal, connect SWD IO, SWD CLK, and GND wires respectively as shown in the picture below. You can either solder wires or just touch each of these pads with a pogo pin jig.
[TODO]: add picture of soldered wires.
4. Connect your STLinkv2 to the SWD IO, SWD CLK, and GND pins respectively.
5. Power up your Onewheel and connect with STM32CubeProgrammer. You'll see an error when the CubeProgrammer tries to read the device because of Read Out Protection.
7. Run a full chip erase from the second tab on the left of CubeProgrammer. This will wipe the STM32 completely and remove Read Out Protection. **Make sure you've backed up your firmware before you do this and recorded your Onewheel ID + mileage before doing so.**
8. Go back to the first tab of CubeProgrammer and load the patched firmware file. Hit Download and wait for your STM32 to be updated.
9. Hit Disconnect in CubeProgrammer
10. Power cycle your Onewheel and enjoy your newly patched firmware :)