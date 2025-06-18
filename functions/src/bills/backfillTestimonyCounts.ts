import { groupBy } from "lodash"
import { Array, Optional, Record, String } from "runtypes"
import { db } from "../firebase"
import { currentGeneralCourt } from "../../../common/constants"
import { Testimony } from "../testimony/types"
import BillProcessor from "./BillProcessor"

export type PartialTestimony = Pick<Testimony, "court" | "billId" | "position">

const Args = Record({ billIds: Optional(Array(String)) })

/**
 * Computes correct testimony counts for each bill
 */
class BackfillTestimonyCounts extends BillProcessor {
  private args

  constructor(args: any) {
    super()
    this.args = Args.check(args)
  }

  async process() {
    const testimony = await db
      .collectionGroup("publishedTestimony")
      .where("court", "==", currentGeneralCourt)
      .select("court", "billId", "position")
      .get()
      .then(t => t.docs.map(d => d.data() as PartialTestimony))
    const testimonyByBillId: Map<string, PartialTestimony[]> = new Map(
      Object.entries(groupBy(testimony, "billId"))
    )
    const billIds = this.args.billIds ?? this.billIds
    const updates = new Map(
      billIds.map(id => {
        const testimony = testimonyByBillId.get(id) ?? [],
          positions = testimony.map(t => t.position)
        return [
          id,
          {
            testimonyCount: testimony.length,
            endorseCount: positions.filter(p => p === "endorse").length,
            neutralCount: positions.filter(p => p === "neutral").length,
            opposeCount: positions.filter(p => p === "oppose").length
          }
        ]
      })
    )

    await this.writeBills(updates)
  }

  override get billFields() {
    return [
      "id",
      "testimonyCount",
      "endorseCount",
      "opposeCount",
      "neutralCount"
    ]
  }
}

export const backfillTestimonyCounts = BillProcessor.pubsub(
  BackfillTestimonyCounts,
  "backfillTestimonyCounts"
)
