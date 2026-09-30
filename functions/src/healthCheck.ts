import { onRequest as onRequestV2 } from "firebase-functions/v2/https"
import type { Request, Response } from "express"

if (process.env.FUNCTIONS_EMULATOR === "true") {
  const healthCheckHandler = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    response.status(200).send({ status: "healthy" })
  }

  exports.healthCheck = onRequestV2(healthCheckHandler)
}
