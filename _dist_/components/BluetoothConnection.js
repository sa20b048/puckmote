import React, {useState} from "../../_snowpack/pkg/react.js";
import {FaRegCopy, FaCheck} from "../../_snowpack/pkg/react-icons/fa.js";
const Puck = window.Puck;
Puck.debug = 3;
const BluetoothConnection = () => {
  const [puckDevice, setPuckDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState("");
  const connectToPuck = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
      });
      console.log("Connecting to GATT server...");
      const server = await device.gatt.connect();
      console.log("Getting UART service...");
      const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Getting characteristics...");
      const tx = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      const rx = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
      rx.addEventListener("characteristicvaluechanged", handleNotifications);
      await rx.startNotifications();
      setPuckDevice(device);
      setGattServer(server);
      setTxCharacteristic(tx);
      setRxCharacteristic(rx);
      setIsConnected(true);
      console.log("Connected to Puck.js");
    } catch (error) {
      console.error("Failed to connect to Puck.js:", error);
    }
  };
  const disconnectFromPuck = async () => {
    try {
      if (!puckDevice) {
        console.log("No device connected.");
        return;
      }
      if (rxCharacteristic) {
        console.log("Stopping notifications...");
        await rxCharacteristic.stopNotifications();
        rxCharacteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
        console.log("Notifications stopped.");
      }
      if (gattServer && gattServer.connected) {
        console.log("Disconnecting from GATT server...");
        gattServer.disconnect();
        console.log("Disconnected from GATT server.");
      } else {
        console.log("GATT server is not connected.");
      }
      setPuckDevice(null);
      setGattServer(null);
      setTxCharacteristic(null);
      setRxCharacteristic(null);
      setIsConnected(false);
      console.log("Puck.js disconnected and cleaned up.");
    } catch (error) {
      console.error("Failed to disconnect from Puck.js:", error);
    }
  };
  const handleNotifications = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log("Received data:", value);
    setNotifications((prevNotifications) => prevNotifications + value.replace(/\x1B\[J/g, "").replace(/\n/g, "").replace(/>/g, "").trim()) + "\n";
  };
  const [puckIRStr, setPuckIRStr] = useState("Puck.IR();");
  const [buttonLabel, setButtonLabel] = useState("Copy code");
  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };
  const handleCopyClick = async (pulseTimes) => {
    const irStr = `Puck.IR([${pulseTimes}]);
`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };
  const handleCopyPulseClick = async (pulseTimes) => {
    const irStr = `${pulseTimes}
`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };
  const handleCommandClick = async (pulseTimes) => {
    if (!pulseTimes) {
      console.error("No pulse times provided.");
      return;
    }
    try {
      await Puck.write(`
        LED3.set();
        Puck.IR([${pulseTimes}]);

        repeat();
         LED3.reset();
        `);
      console.log(`Replaying command with pulse times: ${pulseTimes}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };
  const [isModalOpen, setModalOpen] = useState(false);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-900 p-1 flex justify-end"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => handleCopyClick(notifications),
    className: "bg-gray-600 hover:bg-gray-400 rounded p-1 flex items-center text-sm"
  }, buttonLabel === "Copy code" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FaRegCopy, {
    className: "mr-1"
  }), buttonLabel) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FaCheck, {
    className: "mr-1"
  }), buttonLabel))));
};
export default BluetoothConnection;
