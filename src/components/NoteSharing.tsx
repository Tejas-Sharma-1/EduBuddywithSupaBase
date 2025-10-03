import React, { useState, useEffect } from 'react';
import { Upload, Search, BookOpen, Calendar, User, Download, AlertCircle } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabase';
import type { Note, SearchFilters } from '../types';

export function NoteSharing() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const yearSemesterMap: Record<string, string[]> = {
    '1st Year': ['1st', '2nd'],
    '2nd Year': ['3rd', '4th'],
    '3rd Year': ['5th', '6th'],
    '4th Year': ['7th', '8th'],
  };

  // Branches/Streams list
  const branches = [
    'Computer Science',
    'Textile Chemistry',
    'Textile Technology',
    'Electronics',
    'Fashion Designing',
  ];
  const [openBranch, setOpenBranch] = useState<string | null>(null);

  // Load notes from Supabase on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;

      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        title: note.title,
        description: note.description,
        fileUrl: note.file_url,
        filePath: note.file_path,
        uploadedBy: note.uploaded_by,
        uploadDate: new Date(note.upload_date),
        subject: note.subject,
        year: note.year,
        semester: note.semester,
        category: note.category,
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      const file = formData.get('file') as File;

      if (!file || file.size === 0) {
        throw new Error('Please select a file to upload');
      }

      // Upload file to Supabase Storage
      const { path, publicUrl } = await uploadFile(file);

      // Save note metadata to database
      const noteData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        file_url: publicUrl,
        file_path: path,
        user_name: formData.get('name') as string, // <-- updated to match DB column
        subject: formData.get('subject') as string, // This is now "Stream"
        year: formData.get('year') as string,
        semester: formData.get('semester') as string,
        category: formData.get('category') as string,
        upload_date: new Date().toISOString(),
      };

      console.log("Inserting note:", noteData);

      const { error } = await supabase
        .from('notes')
        .insert([noteData]);

      if (error) {
        console.error("Insert error:", error.message, error.details, error.hint, error.code, error);
        alert("Insert error: " + JSON.stringify(error));
        throw error;
      }

      // Only reset the form if there was no error and the event target is valid
      if (event.currentTarget && typeof (event.currentTarget as HTMLFormElement).reset === 'function') {
        (event.currentTarget as HTMLFormElement).reset();
      }
      setUploadSuccess(true);
      await loadNotes();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (!filters.query) return true;
    
    const searchTerm = filters.query.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.subject.toLowerCase().includes(searchTerm) ||
      note.category.toLowerCase().includes(searchTerm) ||
      note.year.toLowerCase().includes(searchTerm) ||
      note.semester.toLowerCase().includes(searchTerm)
    );
  });

  // Group notes by branch/stream (subject)
  const notesByBranch: Record<string, Note[]> = {};
  notes.forEach(note => {
    if (!notesByBranch[note.subject]) {
      notesByBranch[note.subject] = [];
    }
    notesByBranch[note.subject].push(note);
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 w-full max-w-3xl mx-auto md:p-8 sm:p-4">
      {/* Note Upload Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 text-center sm:text-left">
          <BookOpen size={24} className="text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Share Your Notes</h2>
        </div>

        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg text-green-400">
            ✅ Notes uploaded successfully!
          </div>
        )}
        
        {uploadError && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle size={20} />
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Personal Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Academic Year</label>
              <select
                name="year"
                required
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Year</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
              <select
                name="semester"
                required
                value={yearSemesterMap[selectedYear]?.[0] || ''}
                disabled={!selectedYear}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">{selectedYear ? 'Select Semester' : 'Select Year First'}</option>
                {selectedYear && yearSemesterMap[selectedYear].map((sem) => (
                  <option key={sem} value={sem}>{sem} Semester</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Details Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Database Management Systems Notes"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stream</label>
              <select
                name="subject"
                required
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Stream</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Textile Chemistry">Textile Chemistry</option>
                <option value="Textile Technology">Textile Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion Designing">Fashion Designing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Practice Problems">Practice Problems</option>
                <option value="Previous Year Papers">Previous Year Papers</option>
                <option value="Study Material">Study Material</option>
                <option value="Lab Manual">Lab Manual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              required
              placeholder="Brief description of the notes content..."
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 min-h-[100px]"
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">File (PDF, DOC, DOCX)</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
              <input
                type="file"
                name="file"
                required
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-400">Click to upload or drag and drop</span>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT, PPT, PPTX (Max 10MB)</p>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Share Notes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notes Search Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 text-center sm:text-left">
          <Search size={24} className="text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Find Notes ({filteredNotes.length})</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by subject, keyword, or semester..."
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Branches as clickable categories (collapsible) */}
        <div className="space-y-4">
          {branches.map(branch => (
            <div key={branch} className="border border-gray-700 rounded-lg">
              <button
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-800 hover:bg-gray-700 text-left text-blue-400 font-bold text-lg rounded-lg focus:outline-none transition-colors"
                onClick={() => setOpenBranch(openBranch === branch ? null : branch)}
                aria-expanded={openBranch === branch}
              >
                <span>{branch}</span>
                <span>{openBranch === branch ? '▲' : '▼'}</span>
              </button>
              {openBranch === branch && (
                <div className="p-4 space-y-4 bg-gray-750">
                  {(notesByBranch[branch] && notesByBranch[branch].length > 0) ? (
                    notesByBranch[branch].map(note => (
                      <div key={note.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">{note.title}</h4>
                          <p className="text-gray-400 mt-2">{note.description}</p>
                          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <BookOpen size={16} />
                              {note.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              {note.uploadDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={16} />
                              {note.uploadedBy}
                            </span>
                            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                              {note.year}
                            </span>
                            <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                              {note.semester} Semester
                            </span>
                            <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                              {note.category}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Download size={16} />
                            Download Notes
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">No notes found for this branch.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}