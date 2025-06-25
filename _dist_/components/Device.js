import React, {useEffect, useState} from "../../_snowpack/pkg/react.js";
import {FaRegCopy, FaCheck} from "../../_snowpack/pkg/react-icons/fa.js";
import {fetchDevice, useAsync} from "../irdb.js";
import {EncodeIR} from "../wasm/EncodeIR.js";
import BluetoothConnection from "./BluetoothConnection.js";
import DeviceCommandManager from "./DeviceCommandManager.js";
const Puck = window.Puck;
Puck.debug = 3;
export const Device = ({path}) => {
  const fns = useAsync(() => fetchDevice(path), [path]);
  const [fn, setFn] = useState();
  const [puckIRStr, setPuckIRStr] = useState("Puck.IR();");
  const [buttonLabel, setButtonLabel] = useState("Copy code");
  const [addedDeviceList, setAddedDeviceList] = useState([]);
  const [addedCommandList, setAddedCommandList] = useState([]);
  const [generatedButtons, setGeneratedButtons] = useState([]);
  useEffect(() => {
    if (fns) {
      setGeneratedButtons(fns);
    }
  }, [fns]);
  const trigger = async (fn2, send) => {
    setFn(fn2);
    if (send)
      await emit(fn2, setPuckIRStr, showCopyFeedback);
  };
  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };
  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(puckIRStr);
    showCopyFeedback();
  };
  const saveStateToJson = () => {
    const state = {
      devices: addedDeviceList,
      commands: addedCommandList,
      generatedButtons
    };
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device_commands_state.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleCommandClick = async (pulseTimes) => {
    if (!pulseTimes) {
      console.error("No pulse times provided.");
      return;
    }
    try {
      await Puck.write(`Puck.IR([${pulseTimes}]);
`);
      console.log(`Replaying command with pulse times: ${pulseTimes}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };
  const loadStateFromJson = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const state = JSON.parse(content);
        setAddedDeviceList((prevDevices) => {
          const newDevices = (state.devices || []).filter((device) => !prevDevices.includes(device));
          return [...prevDevices, ...newDevices];
        });
        setAddedCommandList((prevCommands) => {
          const newCommands = (state.commands || []).filter((command) => !prevCommands.some((prevCommand) => prevCommand.device === command.device && prevCommand.title === command.title && prevCommand.pulseTimes === command.pulseTimes));
          return [...prevCommands, ...newCommands];
        });
        if (state.generatedButtons) {
          setGeneratedButtons((prevButtons) => {
            const newButtons = state.generatedButtons.filter((newButton) => !prevButtons.some((prevButton) => prevButton.functionname === newButton.functionname && prevButton.protocol === newButton.protocol && prevButton.device === newButton.device && prevButton.subdevice === newButton.subdevice && prevButton.function === newButton.function));
            return [...prevButtons, ...newButtons];
          });
        }
      };
      reader.readAsText(file);
    }
  };
  const clearState = () => {
    setAddedDeviceList([]);
    setAddedCommandList([]);
    setGeneratedButtons([]);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(BluetoothConnection, null), /* @__PURE__ */ React.createElement(DeviceCommandManager, {
    onCommandClick: handleCopyClick
  })), /* @__PURE__ */ React.createElement("div", {
    className: "m-2 mt-8 flex justify-between gap-4 flex-col md:flex-row"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(FnVis, {
    fn
  })), /* @__PURE__ */ React.createElement("div", {
    className: "opacity-20"
  }, path)), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-800 bg-white p-2 rounded"
  }, fns && /* @__PURE__ */ React.createElement("nav", {
    className: "flex flex-wrap"
  }, generatedButtons.map((fn2, i) => /* @__PURE__ */ React.createElement(Button, {
    key: i,
    fn: fn2,
    trigger
  })), addedCommandList.map((command, idx) => /* @__PURE__ */ React.createElement("button", {
    key: idx,
    onClick: () => handleCommandClick(command.pulseTimes),
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, command.title)), /* @__PURE__ */ React.createElement("div", {
    className: "flex gap-4"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: saveStateToJson,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "Save Buttons Locally"), /* @__PURE__ */ React.createElement("label", {
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "Load Buttons to Page", /* @__PURE__ */ React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: loadStateFromJson,
    className: "hidden"
  })), /* @__PURE__ */ React.createElement("button", {
    onClick: clearState,
    className: "p-2 bg-red-500 text-white rounded hover:bg-red-600"
  }, "Delete all Buttons"))), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-600 p-2 rounded"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "p-1"
  }, 'Copy this text to the "AsTeRICS Grid Puck Action":'), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-900 p-1 flex justify-end"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: handleCopyClick,
    className: "bg-gray-600 hover:bg-gray-400 rounded p-1 flex items-center text-sm"
  }, buttonLabel === "Copy code" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FaRegCopy, {
    className: "mr-1"
  }), buttonLabel) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FaCheck, {
    className: "mr-1"
  }), buttonLabel))), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-800 p-2 pr-12 break-words word-break[break-all]"
  }, puckIRStr))));
};
const Button = ({fn, trigger}) => {
  const [active, setActive] = useState(false);
  const click = async () => {
    setActive(true);
    await trigger(fn, true);
    setActive(false);
  };
  const enter = () => trigger(fn, false);
  return /* @__PURE__ */ React.createElement("button", {
    className: "m-2 p-2 text-white rounded shadow transition-colors " + (active ? "bg-blue-500" : "bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"),
    type: "button",
    onClick: click,
    onMouseEnter: enter
  }, fn.functionname);
};
const FnVis = ({fn}) => {
  const [m, setM] = useState([]);
  let text = "–";
  let x = 0;
  const scale = 3;
  try {
    useEffect(() => {
      if (fn)
        decode(fn).then(setM);
    }, [fn]);
    text = fn ? `${fn.protocol} ${fn.device} ${fn.subdevice} ${fn.function}` : "–";
  } catch (err) {
    text = "Problem decoding IR code: " + err;
    console.error(text);
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col"
  }, /* @__PURE__ */ React.createElement("div", null, text), /* @__PURE__ */ React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    height: "5",
    style: {width: "100%"}
  }, m.map((val, i) => {
    const p = x;
    x += val;
    if (i % 2)
      return null;
    return /* @__PURE__ */ React.createElement("rect", {
      key: i,
      x: p * scale,
      width: val * scale,
      fill: "currentColor",
      height: "10"
    });
  })));
};
const decode = async (fn) => {
  try {
    const result = await EncodeIR(fn.protocol, parseInt(fn.device, 10), parseInt(fn.subdevice, 10), parseInt(fn.function, 10));
    return result.split(" ").map(parseFloat).map((v) => v / 1e3);
  } catch (err) {
    console.error("Problem decoding IR code: " + err);
    throw err;
  }
};
const emit = async (fn, setPuckIRStr, showCopyFeedback) => {
  if (last === fn) {
    await Puck.write("repeat();\nLED2.set();setTimeout(() => LED2.reset(), 500)\n");
  } else {
    last = fn;
    try {
      const millis = await decode(fn);
      let irStr = `[${millis.map((n) => n.toFixed(2)).join(",")}]`;
      const newPuckIRStr = `Puck.IR(${irStr});\\n`;
      setPuckIRStr(newPuckIRStr);
      navigator.clipboard.writeText(newPuckIRStr);
      showCopyFeedback();
      await Puck.write(`
        LED3.set();
        function repeat() {
          Puck.IR(${irStr});
        };
        repeat();
        LED3.reset();
      `);
    } catch (err) {
      setPuckIRStr("Problem decoding IR code: " + err);
      showCopyFeedback();
    }
  }
};
let last = null;
export default Device;
