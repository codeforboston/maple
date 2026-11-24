const PRODUCTION_PROJECT = "digital-testimony-prod"

export const isProduction = () =>
  process.env.GCLOUD_PROJECT === PRODUCTION_PROJECT
