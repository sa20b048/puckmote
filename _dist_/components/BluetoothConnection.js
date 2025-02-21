import React, {useState} from "../../_snowpack/pkg/react.js";
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
    setNotifications((prevNotifications) => prevNotifications + value.trim());
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    id: "connect",
    onClick: connectToPuck
  }, "Connect to Puck.js"), /* @__PURE__ */ React.createElement("button", {
    id: "disconnect",
    onClick: disconnectFromPuck
  }, "Disconnect from Puck.js"), /* @__PURE__ */ React.createElement("div", {
    style: {marginTop: "20px", padding: "10px", background: "#f4f4f4", borderRadius: "5px"}
  }, /* @__PURE__ */ React.createElement("h3", null, "Received Data:"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("textarea", {
    id: "d-array",
    value: notifications,
    readOnly: true,
    style: {width: "100%", height: "150px", marginTop: "10px"}
  }), /* @__PURE__ */ React.createElement("p", null, "Copy IR Signal from here:"), " ", notifications, " "), " "));
};
export default BluetoothConnection;
