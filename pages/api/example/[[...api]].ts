import express from "express"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"

const app = express()
const router = express.Router()

app.use("/api/example", router)

/**
 * This is an example of how to use express routing with Next.js API routes.
 *
 * You can test this with:
 *
 *  curl -X POST http://localhost:3000/api/example/users/123/testimony/456
 *
 * Or you can use fetch in node or your browser:
 *
 * fetch("http://localhost:3000/api/example/users/123/testimony/456", {
 *  method: "POST",
 * })
 *
 * @see https://expressjs.com/en/4x/api.html#router
 * @see https://nextjs.org/docs/api-routes/introduction
 */
router.post("/users/:uid/testimony/:tid", (req, res) => {
  // The `req` object is actualy next.js's `NextApiRequest` object.
  // We can cast it to that type to get access to the `query` and `cookies`.
  const nextReq: NextApiRequest = req as unknown as any
  const nextRes: NextApiResponse = res as unknown as any

  /**
   * The params parsed from the express route are in `req.params`.
   * @see https://expressjs.com/en/4x/api.html#req.params
   */
  const { uid, tid } = req.params
  console.log(uid, tid)

  /**
   * The Next.js-provided query and cookies are in `req.query` and `req.cookies`.
   * @see https://nextjs.org/docs/api-routes/api-middlewares#custom-config
   */
  console.log(req.params, req.query, req.cookies)

  res.json({ hello: "world" })
})

/**
 * This route will match any request under `/api/example` that is not handled by
 * another route.
 */
router.all(["/", "/*"], (req, res) => {
  res.send(`Hello from ${req.path}!`)
})

/** A handler that create an express app and use it to handle the request. */
const handler: NextApiHandler = async (req, res) => {
  // Pass the request to the express app. The express app will handle the
  // request and send the response. The framework handles waiting for the
  // response to finish.
  app(req, res)
}

export default handler
