import { NextApiRequest, NextApiResponse } from "next";
import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { nanoid } from "nanoid";
import { auth, db } from "../../../../../../components/server-api/init-firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch(req.method) {
    case "POST":
      return await post(req, res);
    default:
      res.status(404)
  }
}

const ReportSchema = z.object({
  reason: z.string().min(1),
  additionalInformation: z.string().optional(),
})

const QuerySchema = z.object({
  tid: z.string(),
  uid: z.string()
})

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {query, body, headers} = req;
  console.log({authorization: headers.authorization})
  // const token = await auth.verifyIdToken(headers.authorization?.slice('Bearer '.length) || '')
  // console.log({token})
  const reportValidation = ReportSchema.safeParse(body);
  const queryValidation = QuerySchema.safeParse(query);
  if(!queryValidation.success) {
    res.status(404).json({
      error: queryValidation.error
    })
    return;
  } 

  const {tid, uid} = queryValidation.data;

  if(!reportValidation.success) {
    res.status(400).json({
      error: reportValidation.error
    })
    return;
  }

  // Check this testimony exists
  const testimonySnap = await db.doc(`users/${uid}/publishedTestimony/${tid}`).get();
  if(!testimonySnap.exists) {
    res.status(404).json({
      error: "User or testimony doesn't exist."
    })
    return;
  }
  
  const id = nanoid()
  const report = {
    ...reportValidation.data,
    version: testimonySnap.data()!.version,
    reporterUid: 'test-reporter-uid', // TODO
    reportDate: Timestamp.fromDate(new Date()),
    testimonyId: tid,
    id,
    reportId: id
  }

  try {
    // Add the report to the backend
    db.doc(`reports/${id}`).set(report)

    res.json({
      data: {
        report,
        id
      },
    });
  } catch (exception) {
    console.error(exception)
    res.status(500).json({
      error: exception
    })
  }

}
