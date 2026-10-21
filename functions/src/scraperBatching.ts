import { last } from "lodash"

export function chooseBatches({
  startAfterId,
  docsPerBatch,
  numBatches,
  ids: rawIds
}: {
  startAfterId: string
  docsPerBatch: number
  numBatches: number
  ids: (string | undefined | null)[]
}): string[][] {
  return selectBatchRun({
    startAfterId,
    docsPerBatch,
    numBatches,
    ids: rawIds
  }).batches
}

export function selectBatchRun({
  startAfterId,
  docsPerBatch,
  numBatches,
  ids: rawIds
}: {
  startAfterId: string
  docsPerBatch: number
  numBatches: number
  ids: (string | undefined | null)[]
}) {
  const allIds = [...new Set(rawIds.filter(Boolean) as string[])].sort()
  const nextIndex = allIds.findIndex(id => id > startAfterId)
  const startIndex = nextIndex === -1 ? 0 : nextIndex
  const count = Math.min(docsPerBatch * numBatches, allIds.length)
  const selected = [
    ...allIds.slice(startIndex, startIndex + count),
    ...allIds.slice(0, Math.max(0, count - (allIds.length - startIndex)))
  ]
  const batches: string[][] = []

  for (let start = 0; start < selected.length; start += docsPerBatch) {
    batches.push(selected.slice(start, start + docsPerBatch))
  }

  return {
    batches,
    nextLastId: last(selected),
    cycleComplete: selected.length > 0 && startIndex + count >= allIds.length
  }
}

export function isRefreshCycleComplete({
  cycleClosed,
  completedBatches,
  expectedBatches
}: {
  cycleClosed: boolean
  completedBatches: number
  expectedBatches: number
}): boolean {
  return (
    cycleClosed && expectedBatches > 0 && completedBatches >= expectedBatches
  )
}
