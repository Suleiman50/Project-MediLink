import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        {
          role: 'system',
          content:
            'You are a virtual medical diagnosing assistant. Your job is to: Ask the patient 3 to 6 clear and medically relevant questions based on their initial complaint. Wait for the users answers before asking the next question. After gathering enough information, provide a rough preliminary diagnosis. Always mention that this is NOT a final diagnosis and that the patient should consult a real doctor ',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const completion = response.choices[0]?.message?.content;
    return NextResponse.json({ text: completion });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
