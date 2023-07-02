import * as functions from 'firebase-functions';
import { subscribeToBillTopic } from './subscribeToBillTopic';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export const followBill = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const user: UserRecord = await getAuth().getUser(context.auth.uid);  // Get user based on UID
  const billLookup = data.billLookup;
  const db: Firestore = getFirestore();

  try {
    await subscribeToBillTopic({ user, billLookup, db });
    return { status: 'success', message: 'Bill subscription added' };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', 'Failed to subscribe to bill', { details: error.message });
  }
});
