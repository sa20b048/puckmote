import React, {useState, useEffect} from "../../_snowpack/pkg/react.js";
const IRPulseManager = () => {
  const [notes, setNotes] = useState([]);
  const [commands, setCommands] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const savedCommands = JSON.parse(localStorage.getItem("commands") || "{}");
    setNotes(savedNotes);
    setCommands(savedCommands);
  }, []);
  const saveNotes = (updatedNotes, updatedCommands) => {
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    localStorage.setItem("commands", JSON.stringify(updatedCommands));
    setNotes(updatedNotes);
    setCommands(updatedCommands);
  };
  const addNote = () => {
    if (!title || !content) {
      alert("Bitte Titel und Notiz eingeben.");
      return;
    }
    const newCommands = {...commands, [title]: [content]};
    const newNotes = [...notes, {title, text: content, color, shadow: "1px 1px 4px 1px #000"}];
    saveNotes(newNotes, newCommands);
    setTitle("");
    setContent("");
    setColor("#ffffff");
  };
  const deleteNote = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    const newCommands = {...commands};
    delete newCommands[notes[index].title];
    saveNotes(newNotes, newCommands);
  };
  return /* @__PURE__ */ React.createElement("div", {
    style: {padding: "20px"}
  }, /* @__PURE__ */ React.createElement("h1", null, "IR Pulse Time Manager"), /* @__PURE__ */ React.createElement("input", {
    value: title,
    onChange: (e) => setTitle(e.target.value),
    placeholder: "Title"
  }), /* @__PURE__ */ React.createElement("input", {
    value: content,
    onChange: (e) => setContent(e.target.value),
    placeholder: "Pulse Times"
  }), /* @__PURE__ */ React.createElement("input", {
    type: "color",
    value: color,
    onChange: (e) => setColor(e.target.value)
  }), /* @__PURE__ */ React.createElement("button", {
    onClick: addNote
  }, "Add New Pulse Time"), /* @__PURE__ */ React.createElement("div", null, notes.map((note, index) => /* @__PURE__ */ React.createElement("div", {
    key: index,
    style: {background: note.color, boxShadow: note.shadow, padding: "10px", margin: "5px"}
  }, /* @__PURE__ */ React.createElement("h2", null, note.title), /* @__PURE__ */ React.createElement("p", null, note.text), /* @__PURE__ */ React.createElement("button", {
    onClick: () => deleteNote(index)
  }, "Löschen")))));
};
export default IRPulseManager;
