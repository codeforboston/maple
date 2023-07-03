import * as functions from 'firebase-functions';
import { unsubscribeToBillTopic } from './unsubscribeToBillTopic';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export const unfollowBill = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const user: UserRecord = await getAuth().getUser(context.auth.uid);  // Get user based on UID
  const billLookup = data.billLookup;
  const db: Firestore = getFirestore();

  try {
    await unsubscribeToBillTopic({ user, billLookup, db });
    return { status: 'success', message: 'Bill subscription removed' };
  } catch (error: any) {
    console.error(`Error in unfollowBill for user ${context.auth.uid}:`, error.stack);
  
    if (error.code === 'not-found') {
      throw new functions.https.HttpsError('not-found', 'The specified bill could not be found');
    }
    
    if (error.code === 'permission-denied') {
      throw new functions.https.HttpsError('permission-denied', 'The function does not have permission to perform this operation');
    }

    if (error.code === 'already-exists') {
      throw new functions.https.HttpsError('already-exists', 'The bill is not currently subscribed to');
    }

    if (error.code === 'resource-exhausted') {
      throw new functions.https.HttpsError('resource-exhausted', 'The function has exhausted its available quota');
    }

    if (error.code === 'failed-precondition') {
      throw new functions.https.HttpsError('failed-precondition', 'The bill is not currently subscribed to');
    }

    if (error.code === 'aborted') {
      throw new functions.https.HttpsError('aborted', 'The operation was aborted');
    }

    if (error.code === 'out-of-range') {
      throw new functions.https.HttpsError('out-of-range', 'The operation was attempted past the valid range');
    }

    if (error.code === 'unimplemented') {
      throw new functions.https.HttpsError('unimplemented', 'The operation is not implemented or is not supported/enabled');
    }

    if (error.code === 'internal') {
      throw new functions.https.HttpsError('internal', 'The operation encountered an internal error');
    }
  
    // If the error is not one of the expected types, rethrow as a generic internal error
    throw new functions.https.HttpsError('internal', 'Failed to unsubscribe from bill', { details: error.message });
  }
  
});
