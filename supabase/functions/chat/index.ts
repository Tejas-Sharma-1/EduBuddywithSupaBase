// TODO: Fix: Cannot find module 'npm:openai@3.3.0' or its corresponding type declarations.
// TODO: Fix: Cannot find name 'Deno'.
// If this is not a Deno environment, consider replacing Deno-specific code with Node.js equivalents or ensure the environment supports Deno.

import { Configuration, OpenAIApi } from 'npm:openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // System message to define the AI's role and knowledge
    const systemMessage = {
      role: "system",
      content: `You are EduBuddy, an educational assistant for college students. You have expertise in:
        - Operating Systems (Process Management, Memory Management, File Systems, etc.)
        - Web Technologies (HTML5, CSS3, JavaScript, Client/Server-side technologies)
        - Computer Organization (Digital Logic, CPU Organization, Memory Organization)
        - Data Structures and Algorithms
        - Programming concepts
        
        Always provide detailed, accurate information and include relevant study resources when appropriate.
        Format your responses clearly with proper sections and bullet points when needed.
        When possible, include links to GeeksForGeeks articles in markdown format: [Title](URL)`
    };

    // Make the API call to OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.data.choices[0].message?.content || "I apologize, but I couldn't process that request.";

    // Return the response
    return new Response(
      JSON.stringify({ response: responseText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});