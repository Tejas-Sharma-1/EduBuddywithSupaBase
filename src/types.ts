// Types for our application components and data structures
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  resources?: Array<{
    title: string;
    url: string;
  }>;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  filePath?: string;
  uploadedBy: string;
  uploadDate: Date;
  subject: string;
  year: string;
  semester: string;
  category: string;
}

export interface SearchFilters {
  subject?: string;
  query?: string;
  year?: string;
  semester?: string;
  category?: string;
}

export interface Resource {
  id: string;
  type: 'syllabus' | 'notes' | 'paper';
  title: string;
  subject: string;
  year: string;
  semester: string;
  fileUrl: string;
  description?: string;
}