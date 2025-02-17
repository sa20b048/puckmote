import React, { useState, useEffect } from "react";

const App: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [commands, setCommands] = useState<{ [key: string]: string[] }>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const savedCommands = JSON.parse(localStorage.getItem("commands") || "{}");
    setNotes(savedNotes);
    setCommands(savedCommands);
  }, []);

  const saveNotes = (updatedNotes: any[], updatedCommands: { [key: string]: string[] }) => {
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
    const newCommands = { ...commands, [title]: [content] };
    const newNotes = [...notes, { title, text: content, color, shadow: "1px 1px 4px 1px #000" }];
    saveNotes(newNotes, newCommands);
    setTitle("");
    setContent("");
    setColor("#ffffff");
  };

  const deleteNote = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    const newCommands = { ...commands };
    delete newCommands[notes[index].title];
    saveNotes(newNotes, newCommands);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>IR Pulse Time Manager</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Pulse Times" />
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <button onClick={addNote}>Add New Pulse Time</button>
      <div>
        {notes.map((note, index) => (
          <div key={index} style={{ background: note.color, boxShadow: note.shadow, padding: "10px", margin: "5px" }}>
            <h2>{note.title}</h2>
            <p>{note.text}</p>
            <button onClick={() => deleteNote(index)}>Löschen</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const IRPulseManager = () => {
  // Your component logic here
  return <div>IR Pulse Manager Component</div>;
};
