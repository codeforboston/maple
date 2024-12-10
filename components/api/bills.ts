import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // Path to Firebase initialization

export async function followBill(data: { court: number; id: string }) {
  const callable = httpsCallable(functions, "followBill");
  return callable(data);
}

export async function unfollowBill(data: { court: number; id: string }) {
  const callable = httpsCallable(functions, "unfollowBill");
  return callable(data);
}
