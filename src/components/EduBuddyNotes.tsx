import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EduBuddyNotes() {
  const [userName, setUserName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);

  // Fetch notes from Supabase
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("upload_date", { ascending: false });

    if (error) {
      console.log("Error fetching notes:", error);
      alert("Error fetching notes: " + JSON.stringify(error));
    } else {
      setNotes(data);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle file upload + insert into notes table
  const handleShareNote = async () => {
    if (!file) return alert("Please select a file");

    // 1. Upload file to Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(fileName, file);

    if (uploadError) {
      console.log("Upload error:", uploadError);
      alert("Upload error: " + JSON.stringify(uploadError));
      return;
    }

    // 2. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("notes")
      .getPublicUrl(fileName);

    // 3. Insert metadata into notes table (use correct DB field names)
    const noteData = {
      uploaded_by: userName,
      year: academicYear,
      semester: semester,
      title: noteTitle,
      subject: subject,
      category: category,
      description: description,
      file_url: publicUrlData.publicUrl,
      file_path: fileName,
      // upload_date will be set automatically
    };
    console.log("Inserting note:", noteData);
    const { error: insertError } = await supabase
      .from("notes")
      .insert([noteData]);

    if (insertError) {
      console.log("Insert error:", insertError);
      alert("Insert error: " + JSON.stringify(insertError));
      return;
    }

    // Reset form + fetch notes again
    setUserName("");
    setAcademicYear("");
    setSemester("");
    setNoteTitle("");
    setSubject("");
    setCategory("");
    setDescription("");
    setFile(null);
    fetchNotes();
  };

  return (
    <div className="p-4">
      <h2>Share Your Notes</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
        <option value="">Select Year</option>
        <option value="1st Year">1st Year</option>
        <option value="2nd Year">2nd Year</option>
        <option value="3rd Year">3rd Year</option>
        <option value="4th Year">4th Year</option>
      </select>

      <select value={semester} onChange={(e) => setSemester(e.target.value)}>
        <option value="">Select Semester</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
      </select>

      <input
        type="text"
        placeholder="Note Title"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="Lecture">Lecture</option>
        <option value="Assignment">Assignment</option>
        <option value="Notes">Notes</option>
      </select>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleShareNote}>Share Notes</button>

      <h3>Find Notes</h3>
      {notes.length === 0 && <p>No notes found. Be the first to share!</p>}
      {notes.map((note) => (
        <div key={note.id} className="border p-2 my-2">
          <h4>{note.title} ({note.year}, Sem {note.semester})</h4>
          <p>{note.subject} | {note.category}</p>
          <p>{note.description}</p>
          <a href={note.file_url} target="_blank" rel="noopener noreferrer">
            View / Download
          </a>
        </div>
      ))}
    </div>
  );
}
