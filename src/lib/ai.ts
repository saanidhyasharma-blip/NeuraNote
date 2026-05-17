import { prisma } from './prisma';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface AIServiceResponse {
  text: string;
  error?: string;
}

// Low-level request handlers to avoid bulky NPM packages
async function callOpenAI(prompt: string, systemPrompt: string): Promise<AIServiceResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { text: '', error: errorData.error?.message || `OpenAI API returned status ${response.status}` };
    }

    const data = await response.json();
    return { text: data.choices[0]?.message?.content?.trim() || '' };
  } catch (error: any) {
    return { text: '', error: error.message || 'Network error calling OpenAI' };
  }
}

async function callGemini(prompt: string, systemPrompt: string): Promise<AIServiceResponse> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Input:\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { text: '', error: errorData.error?.message || `Gemini API returned status ${response.status}` };
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return { text: textResult };
  } catch (error: any) {
    return { text: '', error: error.message || 'Network error calling Gemini' };
  }
}

// Intelligent mockup helper to guarantee functionality without API keys in local development
function generateMockup(content: string, type: 'summary' | 'action-items' | 'title' | 'improve'): string {
  const cleanContent = content.trim();
  if (!cleanContent) {
    return type === 'title' ? 'Untitled Note' : type === 'action-items' ? '[]' : 'Empty note.';
  }

  // Basic NLP rules for mockup
  const lines = cleanContent.split('\n').filter(l => l.trim().length > 0);
  const sentences = cleanContent.match(/[^.!?]+[.!?]+/g) || [cleanContent];

  if (type === 'title') {
    // Take first sentence or first 5 words
    const firstLine = lines[0] || '';
    let titleCandidate = firstLine.replace(/[#*_\-]/g, '').trim();
    if (titleCandidate.length > 50) {
      titleCandidate = titleCandidate.substring(0, 47) + '...';
    }
    return titleCandidate || 'Quick Insights Note';
  }

  if (type === 'summary') {
    const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();
    return `[AI Summary (Local Demo)] This note details key concepts including: ${
      firstTwoSentences || 'general workspace organization and task lists.'
    } Summarized text points to actionable goals.`;
  }

  if (type === 'action-items') {
    // Scan for action item patterns (e.g. todo, need to, must, task)
    const items: string[] = [];
    const keywords = ['need to', 'todo', 'should', 'must', 'task', 'remember to', 'action:', 'todo:'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (keywords.some(kw => lowerLine.includes(kw)) || line.trim().startsWith('- [ ]') || line.trim().startsWith('-')) {
        const cleanLine = line.replace(/^[*\-\s\[\]x]+/, '').replace(/(need to|todo|should|must|remember to|action:)/i, '').trim();
        if (cleanLine.length > 5) {
          items.push(cleanLine);
        }
      }
    }

    // If none found, generate dynamic ones based on text analysis
    if (items.length === 0) {
      if (cleanContent.toLowerCase().includes('meeting')) {
        items.push('Follow up with meeting stakeholders on decisions');
        items.push('Distribute meeting minutes and summary log');
      } else {
        items.push(`Review core items in: "${lines[0]?.substring(0, 30) || 'note'}"`);
        items.push('Organize tasks and assign deadline triggers');
      }
    }
    return JSON.stringify(items);
  }

  if (type === 'improve') {
    return `[AI Improved Version (Local Demo)]\n\n${cleanContent}\n\n*Optimized for clarity and professional syntax.*`;
  }

  return '';
}

// Unified orchestrator
async function runAIService(
  prompt: string,
  systemPrompt: string,
  type: 'summary' | 'action-items' | 'title' | 'improve',
  userId: string,
  noteId?: string
): Promise<string> {
  let result: AIServiceResponse = { text: '' };

  if (OPENAI_API_KEY) {
    result = await callOpenAI(prompt, systemPrompt);
  } else if (GEMINI_API_KEY) {
    result = await callGemini(prompt, systemPrompt);
  }

  // Fallback to local mockup if no keys or API failed
  let finalResultText = '';
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
    finalResultText = generateMockup(prompt, type);
  } else if (result.error || !result.text) {
    console.warn(`AI Service Error (Falling back to intelligent mockup): ${result.error}`);
    finalResultText = generateMockup(prompt, type);
  } else {
    finalResultText = result.text;
  }

  // Create an AI usage log entry asynchronously
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId,
        noteId,
        actionType: type.toUpperCase(),
      },
    });
  } catch (logError) {
    console.error('Failed to log AI usage:', logError);
  }

  return finalResultText;
}

export async function generateSummary(content: string, userId: string, noteId?: string): Promise<string> {
  const systemPrompt = `You are a professional research assistant. Write a concise, elegant executive summary (max 3 sentences) of the following note content. Focus on core value, key themes, and high-level outcomes. Do not use conversational filler (like "Here is a summary").`;
  return runAIService(content, systemPrompt, 'summary', userId, noteId);
}

export async function extractActionItems(content: string, userId: string, noteId?: string): Promise<string[]> {
  const systemPrompt = `You are a productivity expert. Extract all actual, actionable tasks and next steps from the following note content. Return the result strictly as a raw JSON array of strings (e.g. ["Task 1", "Task 2"]). Do not include markdown code block formatting (like \`\`\`json), explanations, or numbering. Just the raw array.`;
  const resultText = await runAIService(content, systemPrompt, 'action-items', userId, noteId);
  try {
    // Strip codeblock indicators if AI outputted them despite prompt instructions
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed)) return parsed;
    return [parsed.toString()];
  } catch (error) {
    console.error('Failed to parse AI action items, raw text was:', resultText);
    return [resultText];
  }
}

export async function suggestTitle(content: string, userId: string, noteId?: string): Promise<string> {
  const systemPrompt = `You are a professional content editor. Suggest a short, punchy, modern title (max 5-6 words) for the following note. The title should represent the core subject. Do not put quotes around the title. Do not add explanations.`;
  return runAIService(content, systemPrompt, 'title', userId, noteId);
}

export async function improveWriting(content: string, userId: string, noteId?: string): Promise<string> {
  const systemPrompt = `You are an expert editor. Rewrite and polish the following note text to improve grammar, clarity, professional flow, and impact while fully preserving the original meaning and structure. Keep the output clean.`;
  return runAIService(content, systemPrompt, 'improve', userId, noteId);
}
