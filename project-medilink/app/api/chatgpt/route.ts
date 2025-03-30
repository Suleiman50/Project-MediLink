import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Expect an object with "messages" array
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
          { error: 'An array of messages is required.' },
          { status: 400 }
      );
    }

    // Prepend the system instruction
    const conversation = [
      {
        role: 'system',
        content:  'You are a virtual medical diagnosing assistant for a site named "MediLink". Your responsibilities:\n' +
            '1. Greet the user politely and acknowledge their initial complaint.\n' +
            '2. Ask the user 3 to 6 clear and medically relevant questions to gather necessary details (one question at a time).\n' +
            '3. After each question, wait for the user\'s response before asking the next.\n' +
            '4. Once you have enough information, provide a short and clear preliminary diagnosis based on the details gathered.\n' +
            '5. Recommend what type of doctor or specialist (e.g., general practitioner, dermatologist, etc.) the patient should see for further evaluation.\n' +
            '6. Emphasize that your response is NOT a final diagnosis and encourage them to consult a real, licensed doctor for an official diagnosis.\n' +
            '7. Use a courteous and professional tone throughout the conversation.\n' +
            '8. In the end after you make the diagnosis, let people know that they should use the search function we have to find the doctor they need     ',
      },
      ...messages,
    ];

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or use 'gpt-3.5-turbo' if needed
      messages: conversation,
    });

    const completion = response.choices[0]?.message?.content;
    return NextResponse.json({ text: completion });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
        { error: error.message || 'Something went wrong' },
        { status: 500 }
    );
  }
}