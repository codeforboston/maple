import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize the Firebase app if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    // The database URL is not always needed here, but if you have one, you can add it.
    // databaseURL: "https://your-project-id.firebaseio.com",
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { uid } = req.query; // 'uid' is the user ID from the URL

    if (!uid) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the Firestore instance
    const firestore = getFirestore();

    try {
        const testimoniesRef = firestore.collection('users').doc(uid as string).collection('publishedTestimony');
        const snapshot = await testimoniesRef.get();
        res.status(200).json({ count: snapshot.size });
    } catch (error) {
        console.error("Error fetching testimony count for user:", uid, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
