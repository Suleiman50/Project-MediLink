import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

/*────────────────────────  helper  ────────────────────────*/
function getProfileField(field: string | undefined): string {
  return field && field.trim() !== '' ? field : 'not specified';
}

/*───────────────────────  handler  ────────────────────────*/
export async function POST(request: NextRequest) {
  try {
    /* Parse incoming JSON */
    const payload = await request.json();
    const { messages, userType, medicalProfile, doctorProfile } = payload;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
          { error: 'An array of messages is required.' },
          { status: 400 }
      );
    }

    /*────────────── 1️⃣ Build the system prompt ─────────────*/
    let systemMessage = '';

    /* ——— PATIENT branch (unchanged) ——— */
    if (userType && userType.toLowerCase() === 'patient') {
      systemMessage =
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

      const weight     = getProfileField(medicalProfile?.weight);
      const height     = getProfileField(medicalProfile?.height);
      const gender     = getProfileField(medicalProfile?.gender);
      const bloodType  = getProfileField(medicalProfile?.bloodType);
      const dob        = getProfileField(medicalProfile?.dob);
      const allergies  = getProfileField(medicalProfile?.allergies);

      /* derive age if DOB present (DD/MM/YYYY) */
      let age = 'not specified';
      if (dob !== 'not specified') {
        const [day, month, year] = dob.split('/');
        const birth = new Date(`${year}-${month}-${day}`);
        age = (
            Math.abs(
                new Date(Date.now() - birth.getTime()).getUTCFullYear() - 1970
            )
        ).toString();
      }

      systemMessage += `\n\nPatient Medical Profile:
- Weight: ${weight}
- Height: ${height}
- Age: ${age}
- Gender: ${gender}
- Blood Type: ${bloodType}
- Allergies: ${allergies}`;

      /* ——— DOCTOR branch (new) ——— */
    } else if (userType && userType.toLowerCase() === 'doctor') {
      const docFirst = getProfileField(doctorProfile?.first_name);
      const docLast  = getProfileField(doctorProfile?.last_name);
      const spec     = getProfileField(doctorProfile?.specialty);

      systemMessage =
          `You are MediLink’s AI clinical assistant speaking **to** Dr. ${docFirst} ${docLast}, a specialist in **${spec}**.\n` +
          `• Always address the user as **Dr. ${docFirst}**.\n` +
          `• You may use advanced medical terminology—the doctor will understand it.\n` +
          `• Mission: assist Dr. ${docFirst} with evidence-based guidance, differential diagnoses, treatment options, or clinical questions they raise.\n` +
          `• Keep responses concise, reference up-to-date guidelines where relevant, and avoid explaining basic concepts unless asked.`;

      /* ——— Unknown / default branch ——— */
    } else {
      systemMessage =
          'You are MediLink’s AI assistant. Politely ask whether the user is a patient or a doctor so you can tailor your help.';
    }

    /*────────────── 2️⃣ Build final conversation array ───────*/
    const conversation = [
      { role: 'system', content: systemMessage },
      ...messages
    ];

    /*────────────── 3️⃣ Call OpenAI ————————————————*/
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',  // or 'gpt-4.1'
      messages: conversation
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