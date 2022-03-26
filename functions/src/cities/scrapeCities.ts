import { isString } from "lodash"
import * as api from "../malegislature"
import { createScraper } from "../scraper"

/**
 * There are around 200 cities, which we scrape every day.
 */
export const { fetchBatch: fetchCityBatch, startBatches: startCityBatches } =
  createScraper({
    resourceName: "cities",
    batchesPerRun: 10,
    resourcesPerBatch: 100,
    startBatchSchedule: "every 24 hours",
    fetchBatchTimeout: 240,
    startBatchTimeout: 60,
    fetchResource: async (court: number, id: string) => {
      const bills = await api.getCityBills(court, id)
      return { bills: bills.map(b => b.BillNumber).filter(isString) }
    },
    listIds: (court: number) => api.listCities(court)
  })
