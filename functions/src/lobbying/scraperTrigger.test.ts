import axios from "axios"
import { GoogleAuth } from "google-auth-library"
import { LobbyingScraperTrigger } from "./scraperTrigger"

jest.mock("axios")
jest.mock("google-auth-library")

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGoogleAuth = GoogleAuth as jest.MockedClass<typeof GoogleAuth>

describe("LobbyingScraperTrigger", () => {
  const originalProject = process.env.GCLOUD_PROJECT

  beforeEach(() => {
    process.env.GCLOUD_PROJECT = "digital-testimony-dev"
    mockedGoogleAuth.prototype.getClient = jest.fn().mockResolvedValue({
      getAccessToken: jest.fn().mockResolvedValue({ token: "fake-token" })
    })
    mockedAxios.post.mockResolvedValue({ status: 200 })
  })

  afterEach(() => {
    process.env.GCLOUD_PROJECT = originalProject
    jest.clearAllMocks()
  })

  it("posts to the Cloud Run Admin API for the current project's job", async () => {
    await (new LobbyingScraperTrigger() as any).run()

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://us-central1-run.googleapis.com/v2/projects/digital-testimony-dev/locations/us-central1/jobs/maple-lobbying-scraper:run",
      {},
      { headers: { Authorization: "Bearer fake-token" } }
    )
  })

  it("propagates errors instead of swallowing them", async () => {
    mockedAxios.post.mockRejectedValue(new Error("boom"))

    await expect((new LobbyingScraperTrigger() as any).run()).rejects.toThrow(
      "boom"
    )
  })
})
