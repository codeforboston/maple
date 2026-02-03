import { useState } from "react"
import { Title } from "react-admin"
import { Box, Button, TextField, Alert, CircularProgress } from "@mui/material"
import { httpsCallable } from "firebase/functions"
import { functions } from "components/firebase"

type ScrapeHearingRequest = { eventId: number }
type ScrapeHearingResponse = {
  status: string
  message: string
  hearingId: string
}

const scrapeSingleHearing = httpsCallable<
  ScrapeHearingRequest,
  ScrapeHearingResponse
>(functions, "scrapeSingleHearing")

const scrapeSingleHearingv2 = httpsCallable<
  ScrapeHearingRequest,
  ScrapeHearingResponse
>(functions, "scrapeSingleHearingv2")

export const ScrapeHearingForm = () => {
  const [eventId, setEventId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    const parsedEventId = parseInt(eventId, 10)
    if (isNaN(parsedEventId)) {
      setResult({
        type: "error",
        message: "Please enter a valid numeric Event ID"
      })
      return
    }

    setLoading(true)
    try {
      const response = await scrapeSingleHearingv2({ eventId: parsedEventId })
      setResult({
        type: "success",
        message: `${response.data.message} (ID: ${response.data.hearingId})`
      })
      setEventId("")
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.details?.message || "Failed to scrape hearing"
      setResult({
        type: "error",
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Title title="Scrape Hearing" />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 400
        }}
      >
        <TextField
          label="Hearing Event ID"
          placeholder="e.g., 1234"
          value={eventId}
          onChange={e => setEventId(e.target.value)}
          disabled={loading}
          required
          type="number"
          helperText="Enter the EventId from the MA Legislature website"
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !eventId}
          sx={{ alignSelf: "flex-start" }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Scraping...
            </>
          ) : (
            "Scrape Hearing"
          )}
        </Button>
        {result && (
          <Alert severity={result.type} sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}
      </Box>
    </Box>
  )
}

export const ScrapeHearingList = () => <ScrapeHearingForm />
