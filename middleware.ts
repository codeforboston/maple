// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "./components/server-api/init-firebase-admin";

// https://nextjs.org/docs/advanced-features/middleware#producing-a-response
export const config = {
  matcher: '/api/:function*'
}

/**
 * Ensures that a request has a header with
 * 
 * "authorization": "Bearer <token>"
 * 
 * where the <token> is the id token for Firebase.
 * 
 * See https://firebase.google.com/docs/auth/admin/verify-id-tokens#node.js
 * 
 * @param request a next request
 * @returns true iff the user's id token is verified, false otherwise.
 */
async function isAuthenticated(request: NextRequest) {
  const {headers} = request;
  if(!headers.has("authorization")) {
    return false;
  }
  const value = headers.get("authorization")!
  if(!value.startsWith("Bearer ")) {
    return false;
  }
  const token = value.slice('Bearer '.length);
  try {
    // await auth.verifyIdToken(token, true);
    return true;
  } catch (error) {
    console.error(error)
    return false
  }

}

export async function middleware(request: NextRequest) {

  // if(!isAuthenticated(request)) {
  //   return new NextResponse(
  //     JSON.stringify({error: 'authentication failed'}),
  //     { status: 401, headers: { 'content-type': 'application/json'}}
  //   )
  // } 
}
