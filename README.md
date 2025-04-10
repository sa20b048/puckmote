# Puckmote 

**This fork adds printing out the ```Puck.IR(xxxx)``` command used when sending and IR code. This can be helpful if you want to use the code for integration into another webpage. For example you can use as [IR-remote UART-action](https://www.asterics.eu/manuals/asterics-grid/514_uart-action-tutorials.html#remote-control-infrared) in AsTeRICS Grid, the Open Source AAC web application.**

This is a browser-based remote control using a [PuckJS](https://www.puck-js.com/) to send IR codes.

![Demo GIF](public/demo.gif)


## Development

To get a dev server running:

```bash
npm install
npm start
```

### Frontend tooling

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Snowpack](https://www.snowpack.dev/)

## Links

- https://github.com/probonopd/irdb
- https://github.com/probonopd/MakeHex
- https://www.espruino.com/Puck.js+Infrared
- https://www.espruino.com/ide/

## Why

My TV remote [ran out of batteries](https://twitter.com/benjaminbenben/status/1328756121897742336).

## Getting Started
Visit https://www.espruino.com/ide/ upload Puck.js to the IDE. Press the Chip Icon where it says RAM which should send the Puck.js file to the Puck then disconnect the Puck and you are set.

