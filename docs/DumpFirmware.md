# Instructions to Dump Firmware

The current steps are technically dense and not for the faint of heart. There's tons of room for error and every possibility you could permanently ruin your board. Don't do this unless you absolutely feel confident in your skills to do so.

## Exploit for bypassing STM32 Read Out Protection

- To learn more about how we're dumping the firmware, check out [https://www.usenix.org/system/files/woot20-paper-obermaier.pdf](https://www.usenix.org/system/files/woot20-paper-obermaier.pdf). We'll be using the H3 exploit outlined in that research paper.

- For ease of use, you can use my forked and patched version of the exploit: [https://github.com/outlandnish/f103-analysis](https://github.com/outlandnish/f103-analysis)

- If you don't want to re-write code, use the STM32F3DISCOVERY board mentioned in the research paper as the attack board: [https://www.st.com/en/evaluation-tools/stm32f3discovery.html#sample-buy](https://www.st.com/en/evaluation-tools/stm32f3discovery.html#sample-buy)
    - Can be purchased on Amazon, Digikey, Mouser, etc.

## Pre-requisites

- openocd 0.11.0 or higher
- Some sort of serial monitor that can send data to the chip
    - I used the PlatformIO Serial Monitor with the log2file filter
- STM32F3DISCOVERY board (or equivalent)

## Steps

1. Remove STM32 from Pint / XR controller. Get a pro to do it if you’re not experienced with SMD rework
    1. **Pint only**: Remove the conformal coating from the STM32
    2. Use a rework station to pull the STM32
2. Drop STM32 into a LQFP64 (LQFP100 for the XR) programming socket
    1. Example for Pint: [https://www.amazon.com/SETCTOP-TQFP64-ProgrammerSocket-Adapter-Burning/dp/B097LFT741/ref=sr_1_1?crid=2UJQZNAGALA8U&keywords=lqfp64+socket&qid=1656449143&sprefix=lqfp64+socket%2Caps%2C74&sr=8-1](https://www.amazon.com/SETCTOP-TQFP64-ProgrammerSocket-Adapter-Burning/dp/B097LFT741/ref=sr_1_1?crid=2UJQZNAGALA8U&keywords=lqfp64+socket&qid=1656449143&sprefix=lqfp64+socket%2Caps%2C74&sr=8-1)
3. Follow wiring instructions from the H3 exploit above to connect the STM32F3DISCOVERY board to the programming socket. **NOTE: All VDD, VDDA, VSS, VSSA pins need 3.3V and GND respectively for the chip to power up properly.**

### STM32F103x Pin Mapping

| Function | Label | Pint (LQFP64) | XR (LQFP100) |
| --- | --- | --- | --- |
| 3V3 | VDD_1 | 32 | 50 |
| 3V3 | VDD_2 | 48 | 75 |
| 3V3 | VDD_3 | 64 | 100 |
| 3V3 | VDD_4 | 19 | 28 |
| 3V3 | VDD_5 | N/A | 11 |
| 3V3 | VDD_A | 13 | 22 |
| GND | VSS_1 | 31 | 49 |
| GND | VSS_2 | 47 | 74 |
| GND | VSS_3 | 63 | 99 |
| GND | VSS_4 | 18 | 27 |
| GND | VSS_5 | N/A | 10 |
| GND | VSS_A | 12 | 19 |
| Not Reset | NRST | 7 | 14 |
| SWD IO | PA13 / SWDIO / JTMS | 46 | 72 |
| SWD Clock | PA14 / SWCLK / JTCK | 49 | 76 |
| USART1 Transmit | PB6 / USART1_TX | 58 | 92 |
| USART1 Receive | PB7 / USART1_RX | 59 | 93 |
| BOOT0 | BOOT0 | 60 | 94 |
| BOOT1 | PB2 / BOOT1 | 28 | 37 |

Note: it's helpful to use a breadboard with Power + Ground rails to simplify wiring of the 3V3 and GND lines

4. Connect to the your Pint / XR controller STM32 inside of the programming socket using OpenOCD. You need to load the exploit (shellcode.bin) as outlined in the H3 exploit instructions (copied here for reference):
  - `telnet localhost 4444` (or whatever port you're using for OpenOCD's debugger)
  - `load_image shellcode.bin 0x20000000` (you need shellcode.bin from the `h3/rootshell` directory of the f103-analysis repo)

4. Use a serial monitor to capture serial communication with the chip to a file. I used the PlatformIO serial monitor with the log2file filter to save the serial communication to a file. This can be done with `pio device monitor -b 9600 -f log2file`
  - Serial config: 9600 baud, 8 bits, no parity, 1 stop bit

5. Close OpenOCD. Press the blue button on the STM32F3DISCOVERY Board. You should see `Low-Level Shell v0.1 alpha` if you've connected successfully. Type `F01` and hit Enter to dump the flash contents without offsets in Little Endian order.

5. Clean up the file using a text editor. Remove extra spaces from the top and bottom (including the help / title content). Your first line of the file should be the first line of the dump and the last line of the file should be the last line of the dump.

6. Run the log file through `xd` to convert it into a binary file: `xd -r -p dump.log app.bin`

Complete! Now you've got a binary dump from your Onewheel :)
