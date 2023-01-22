import * as functions from "firebase-functions"

if (process.env.FUNCTIONS_EMULATOR === "true") {
  // Export a health check used
  exports.healthCheck = functions.https.onRequest(async (request, response) => {
    response.status(200).send({ status: "healthy" })
  })
}
