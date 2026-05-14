const express = require("express");
const fs = require("fs");
const app = express();

// This line tells the computer: "If a package comes in, open it and read the note inside."
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Notes API Running");
});

// This is the "Look at my notes" button
app.get("/notes", (req, res) => {
    const data = fs.readFileSync("notes.json", 'UTF-8');
    const notes = JSON.parse(data);
    res.json(notes); // ADDED THIS: You need to send the notes back to the screen!
});

// This is the "Save a new note" button
app.post("/notes", (req, res) => {
    const newNote = req.body; // 1. Catch the new note someone sent you
    const data = fs.readFileSync("notes.json", 'UTF-8'); // 2. Open your notebook
    const notes = JSON.parse(data); // 3. Read what's already in there
    
    notes.push(newNote); // 4. Add the new note to the bottom of the list
    
    fs.writeFileSync("notes.json", JSON.stringify(notes)); // 5. Close the notebook and save it
    res.send("Note saved!"); // 6. Say "I'm done!"
});

app.delete("/notes/:id", (req, res) =>{
    const noteId = req.params.id;
    // 3. Line: The Great Cleaning
    const data = fs.readFileSync("notes.json", 'UTF-8');
    let notes = JSON.parse(data);
    notes.splice(noteId, 1);
    fs.writeFileSync("notes.json", JSON.stringify(notes));
    res.send("Note deleted!");

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});