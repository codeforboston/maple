export function runAgainstEmulators() {
  const host = process.env.SERVER_EMULATOR_HOST ?? "127.0.0.1"
  Object.assign(process.env, {
    NEXT_PUBLIC_PROJECT_ID_FOR_TEST: "demo-dtp",
    GCLOUD_PROJECT: "demo-dtp",
    NEXT_PUBLIC_USE_EMULATOR: "true",
    FIRESTORE_EMULATOR_HOST: `${host}:8080`,
    FIREBASE_AUTH_EMULATOR_HOST: `${host}:9099`,
    FIREBASE_STORAGE_EMULATOR_HOST: `${host}:9199`,
    TYPESENSE_API_URL: `http://${host}:8108`,
    TYPESENSE_API_KEY: "test-api-key"
  })
}

export function runAgainstProject(projectId: string) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!serviceAccount) {
    console.error(
      "Specify the path to the service account in GOOGLE_APPLICATION_CREDENTIALS"
    )
    process.exit(1)
  }

  Object.assign(process.env, {
    GCLOUD_PROJECT: projectId,
    GOOGLE_APPLICATION_CREDENTIALS: serviceAccount
  })
}

export function runAgainstDevWithTestUser() {
  runAgainstProject("digital-testimony-dev")

  const testUserPassword = process.env.SYSTEM_TEST_USER_PASSWORD
  if (!testUserPassword) {
    console.error(
      "Specify the password for systemtestuser@example.com in SYSTEM_TEST_USER_PASSWORD"
    )
    process.exit(1)
  }

  Object.assign(process.env, {
    NEXT_PUBLIC_PROJECT_ID_FOR_TEST: "digital-testimony-dev",
    SYSTEM_TEST_USER_PASSWORD: testUserPassword
  })
}
