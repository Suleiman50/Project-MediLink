import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

/* helper -----------------------------------------------------*/
function getProfileField(field: string | undefined | null): string {
  return field && field.trim() !== "" ? field : "not specified";
}

/* handler ----------------------------------------------------*/
export async function POST(request: NextRequest) {
  try {
    /* 0️⃣  JWT from header or cookie (if any) */
    const headerToken =
        request.headers.get("authorization")?.split(" ")[1] || null;
    const cookieToken = request.cookies.get("token")?.value || null;
    const token = headerToken || cookieToken;

    let decoded: any = {};
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        decoded = {};
      }
    }

    /* 1️⃣  Body */
    const body = await request.json();
    const {
      messages,
      userType: bodyUserType,
      medicalProfile,
      doctorProfile,
    } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
          { error: "An array of messages is required." },
          { status: 400 }
      );
    }

    /* prefer body userType, else fall back to JWT */
    const userType = bodyUserType ?? decoded.userType;

    /* 2️⃣  Build system prompt */
    let system = "";

    /* —— PATIENT branch (UNMODIFIED) —— */
    if (userType && userType.toLowerCase() === "patient") {
      system =
          'You are a virtual medical diagnosing assistant for a site named "MediLink" you can call yourself MediLink\'s AI Assistant or something like that. Your responsibilities:\n' +
          "1. Greet the user politely and acknowledge their initial complaint.\n" +
          "2. Ask the user clear and medically relevant questions to gather necessary details (one question at a time).\n" +
          "3. After each question, wait for the user's response before asking the next.\n" +
          "4. Once you have enough information, provide a short and clear preliminary diagnosis based on the details gathered.\n" +
          "5. Recommend what type of doctor or specialist the patient should see for further evaluation.\n" +
          "6. Emphasize that your response is NOT a final diagnosis and encourage them to consult a real, licensed doctor for an official diagnosis.\n" +
          "7. Use a courteous and professional tone throughout the conversation.\n" +
          "8. At the end, let the user know they can use the site’s search function to find the doctor they need.\n" +
          "9. You will be given the medical profile for the patient below if the patient asks for their data tell them what you know so that you reassure them";

      const weight = getProfileField(medicalProfile?.weight);
      const height = getProfileField(medicalProfile?.height);
      const gender = getProfileField(medicalProfile?.gender);
      const bloodType = getProfileField(medicalProfile?.bloodType);
      const dob = getProfileField(medicalProfile?.dob);
      const allergies = getProfileField(medicalProfile?.allergies);

      /* derive age if DOB present (DD/MM/YYYY) */
      let age = "not specified";
      if (dob !== "not specified") {
        const [d, m, y] = dob.split("/");
        const birth = new Date(`${y}-${m}-${d}`);
        age = String(
            Math.abs(
                new Date(Date.now() - birth.getTime()).getUTCFullYear() - 1970
            )
        );
      }

      system += `\n\nPatient Medical Profile:
- Weight: ${weight}
- Height: ${height}
- Age: ${age}
- Gender: ${gender}
- Blood Type: ${bloodType}
- Allergies: ${allergies}`;

      /* —— DOCTOR branch —— */
    } else if (userType && userType.toLowerCase() === "doctor") {
      /* fetch doctor via JWT id (if present) */
      const dbDoc =
          decoded.id
              ? await prisma.doctor.findUnique({ where: { id: decoded.id } })
              : null;

      /* inside the DOCTOR branch */
      const docFirst = getProfileField(
          doctorProfile?.first_name
          ?? (doctorProfile as any)?.firstName   // camel-case fallback
          ?? dbDoc?.first_name
      );

      const docLast  = getProfileField(
          doctorProfile?.last_name
          ?? (doctorProfile as any)?.lastName    // camel-case fallback
          ?? dbDoc?.last_name
      );
      const spec = getProfileField(doctorProfile?.specialty ?? dbDoc?.specialty);

      system =
          `You are MediLink’s AI clinical assistant speaking **to** Dr. ${docFirst} ${docLast}, a specialist in **${spec}**.\n` +
          `• Always address the user as **Dr. ${docFirst}**.\n` +
          "• You may use advanced medical terminology—the doctor will understand it.\n" +
          "• Mission: assist Dr. " +
          `${docFirst} with evidence-based guidance, differential diagnoses, treatment options, or clinical questions they raise.\n` +
          "• Keep responses concise, cite current guidelines when relevant, and avoid explaining basic concepts unless asked.";
      /* —— Unknown user type —— */
    } else {
      system =
          "You are MediLink’s AI assistant. Politely ask whether the user is a patient or a doctor so you can tailor your help.";
    }

    /* 3️⃣  Call OpenAI */
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "system", content: system }, ...messages],
    });

    return NextResponse.json({ text: resp.choices[0].message?.content });
  } catch (err: any) {
    console.error("[chat route] error:", err);
    return NextResponse.json(
        { error: err.message || "Internal server error" },
        { status: 500 }
    );
  }
}