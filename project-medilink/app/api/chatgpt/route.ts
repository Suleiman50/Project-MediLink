import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/*──────────────────────── helper ────────────────────────*/
function getProfileField(field: string | undefined | null): string {
  return field && field.trim() !== '' ? field : 'not specified';
}

/*────────────────────── handler ─────────────────────────*/
export async function POST(request: NextRequest) {
  try {
    /* 0️⃣  Decode JWT (if provided) */
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    let decoded: any = {};
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        decoded = {};
      }
    }

    /* Body */
    const payload = await request.json();
    const { messages, userType: bodyUserType, medicalProfile } = payload;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
          { error: 'An array of messages is required.' },
          { status: 400 }
      );
    }

    /* final userType preference: JWT > body */
    const userType = decoded.userType || bodyUserType;

    /*────────────── 1️⃣ Build the system prompt ─────────────*/
    let systemMessage = '';

    /* ——— PATIENT branch (UNCHANGED) ——— */
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

      /* ——— DOCTOR branch (NEW) ——— */
    } else if (userType && userType.toLowerCase() === 'doctor') {
      /* Fetch doctor profile from DB using id in JWT */
      const doctorId = decoded.id;
      const doctor =
          doctorId
              ? await prisma.doctor.findUnique({ where: { id: doctorId } })
              : null;

      const docFirst = getProfileField(doctor?.first_name);
      const docLast  = getProfileField(doctor?.last_name);
      const spec     = getProfileField(doctor?.specialty);

      systemMessage =
          `You are MediLink’s AI clinical assistant speaking **to** Dr. ${docFirst} ${docLast}, a specialist in **${spec}**.\n` +
          `• Always address the user as **Dr. ${docFirst}**.\n` +
          `• You may use advanced medical terminology—the doctor will understand it.\n` +
          `• Mission: assist Dr. ${docFirst} with evidence-based guidance, differential diagnoses, treatment options, or clinical questions they raise.\n` +
          `• Keep responses concise, cite current guidelines when relevant, and avoid explaining basic concepts unless asked.\n` +
          `• End each reply with: “Let me know if you need further details, Dr. ${docFirst}.”`;

      /* ——— Unknown / default branch ——— */
    } else {
      systemMessage =
          'You are MediLink’s AI assistant. Politely ask whether the user is a patient or a doctor so you can tailor your help.';
    }

    /*────────────── 2️⃣ Build conversation & call OpenAI ─────*/
    const conversation = [{ role: 'system', content: systemMessage }, ...messages];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: conversation
    });

    return NextResponse.json({ text: resp.choices[0].message?.content });

  } catch (err: any) {
    console.error('OpenAI API error:', err);
    return NextResponse.json(
        { error: err.message || 'Something went wrong' },
        { status: 500 }
    );
  }
}