import React, {useState, useEffect} from "../_snowpack/pkg/react.js";
import {Device} from "./components/Device.js";
import {Choose} from "./components/Choose.js";
import {Title} from "./components/Title.js";
import {DeviceCommandManager} from "./components/DeviceCommandManager.js";
const Puck = window.Puck;
Puck.debug = 3;
export const App = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [isPuckLoaded, setIsPuckLoaded] = useState(false);
  const Puck2 = window.Puck;
  useEffect(() => {
    if (Puck2) {
      setIsPuckLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.puck-js.com/puck.js";
    script.async = true;
    script.onload = () => {
      console.log("Puck.js script loaded successfully.");
      setIsPuckLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Puck.js script.");
    };
    document.body.appendChild(script);
  }, []);
  const handleCommandClick = (pulseTimes) => {
    if (!Puck2) {
      console.error("Puck.js is not loaded.");
      return;
    }
    console.log("Command clicked with pulse times:", pulseTimes);
    Puck2.write(`Puck.IR([${pulseTimes}]);
`);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "m-5 font-mono max-w-5xl"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col md:flex-row gap-8"
  }, /* @__PURE__ */ React.createElement(Title, null), /* @__PURE__ */ React.createElement(Choose, {
    onChoose: setDeviceList
  })), deviceList.map((path) => /* @__PURE__ */ React.createElement(Device, {
    key: path,
    path
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, "=="), isPuckLoaded ? /* @__PURE__ */ React.createElement(DeviceCommandManager, {
    onCommandClick: handleCommandClick
  }) : /* @__PURE__ */ React.createElement("p", null, "Loading Puck.js...")));
};
