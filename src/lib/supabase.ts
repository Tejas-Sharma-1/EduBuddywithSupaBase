import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File upload function
export const uploadFile = async (file: File, bucket: string = 'notes') => {
  const filePath = `pdfs/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf',
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: publicData.publicUrl,
  };
};

// Get file download URL
export const getFileUrl = (path: string, bucket: string = 'notes') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};
// Test connection (list all tables in  public schema)
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('notes').select('*').limit(1);

    if (error) {
      console.error("Supabase connection error:", error.message);
    } else {
      console.log("✅ Supabase connected! Sample data:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}
