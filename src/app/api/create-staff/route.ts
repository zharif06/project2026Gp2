import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  try {
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    return Response.json({ success: true, uid: user.uid });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}