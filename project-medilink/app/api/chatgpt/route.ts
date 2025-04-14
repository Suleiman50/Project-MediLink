import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

// Helper to return a field if it's a non-empty string; otherwise, returns 'not specified'
function getProfileField(field: string | undefined): string {
  return field && field.trim() !== '' ? field : 'not specified';
}

export async function POST(request: NextRequest) {
  try {
    // Parse and log the incoming payload to check if all fields are sent correctly
    const payload = await request.json();
    console.log('Received payload:', payload);

    const { messages, userType, medicalProfile } = payload;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
          { error: 'An array of messages is required.' },
          { status: 400 }
      );
    }

    // Base system prompt for MediLink
    let systemMessage =
        'You are a virtual medical diagnosing assistant for a site named "MediLink" you can call yourself MediLink\'s AI Assistant or something like that. Your responsibilities:\n' +
        '1. Greet the user politely and acknowledge their initial complaint.\n' +
        '2. Ask the user clear and medically relevant questions to gather necessary details (one question at a time).\n' +
        '3. After each question, wait for the user\'s response before asking the next.\n' +
        '4. Once you have enough information, provide a short and clear preliminary diagnosis based on the details gathered.\n' +
        '5. Recommend what type of doctor or specialist the patient should see for further evaluation.\n' +
        '6. Emphasize that your response is NOT a final diagnosis and encourage them to consult a real, licensed doctor for an official diagnosis.\n' +
        '7. Use a courteous and professional tone throughout the conversation.\n' +
        '8. At the end, let the user know they can use the site’s search function to find the doctor they need.\n' +
        '9. You will be given the medical profile for the patient below if the patient asks for their data tell them what you know so that you reassure them';

    // If the user type is "Patient", append their medical profile details.
    if (userType && userType.toLowerCase() === 'patient') {
      const weight = getProfileField(medicalProfile?.weight);
      const height = getProfileField(medicalProfile?.height);
      const gender = getProfileField(medicalProfile?.gender);
      const bloodType = getProfileField(medicalProfile?.bloodType);
      const dob = getProfileField(medicalProfile?.dob);
      const allergies = getProfileField(medicalProfile?.allergies);
      let age = 'not specified';
      if (dob !== 'not specified') {
        // Assumes dob is in DD/MM/YYYY format
        const [day, month, year] = dob.split('/');
        const birthDate = new Date(`${year}-${month}-${day}`);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
      }
      systemMessage += `\n\nPatient Medical Profile:
- Weight: ${weight}
- Height: ${height}
- Age: ${age}
- Gender: ${gender}
- Blood Type: ${bloodType}
- Allergies: ${allergies}`;
    } else {
      console.log('User is not a Patient; medical profile will not be appended.');
    }

    // Prepend the system instruction to the conversation history
    const conversation = [
      { role: 'system', content: systemMessage },
      ...messages,
    ];

    console.log('Final conversation for OpenAI:', conversation);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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