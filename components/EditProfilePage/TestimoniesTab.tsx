import { useState } from "react"
import { Button, Col, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Testimony } from "../db"
import { useTranslation } from "next-i18next"
import { DraftTestimony, publishTestimony } from "components/db/testimony/types"
import { useEditTestimony, useDraftTestimonyListing } from "../db"
import { useAuth } from "components/auth"

import { getDocs, collection, getDoc, updateDoc, doc, setDoc } from "firebase/firestore"
import { firestore } from "components/firebase"
import { nullableQuery } from "components/db/common"
import { ref } from "joi"
import { currentGeneralCourt } from "functions/src/shared"
import { loremIpsum } from "lorem-ipsum"


export const TestimoniesTab = ({
  publishedTestimonies,
  draftTestimonies,
  className
}: {
  publishedTestimonies: Testimony[] | undefined
  draftTestimonies: Testimony[] | undefined
  className: string
}) => {
  const [orderBy, setOrderBy] = useState<string>()
  const { t } = useTranslation("editProfile")

  const user = useAuth()
  const uid = user.user!.uid

  async function listTestimony(uid: string): Promise<Testimony[]> {
    const result = await getDocs(
      nullableQuery(collection(firestore, `/users/${uid}/draftTestimony`))
    )
    return result.docs.map(d => d.data() as Testimony)
  }

  listTestimony(uid).then((d) => console.log(d))

  const getBillIds = async () => {
    const bills = collection(firestore, `/generalCourts/${currentGeneralCourt}/bills/`)
    const bill = await getDocs(bills)
    return bill.docs.map(b => b.data().id)
  }

  const positions = ["endorse", "oppose", "neutral"] as const
  const createDraft = (billId: string) => {
    const draft: DraftTestimony = {
      billId,
      court: currentGeneralCourt,
      position: positions[Math.floor(Math.random() * positions.length)],
      content: loremIpsum({ count: 4, units: "paragraphs" })
    }
    return draft
  }
  const draftsCollectionRef = collection(firestore, `/users/${uid}/draftTestimony`)

  const generateFakeTestimony = async (billId: string) => {
    const draftRef = doc(draftsCollectionRef)
    const draft = createDraft(billId)
    await setDoc(draftRef, {...draft, editReason: "fake"}, { merge: true })

    const r = await publishTestimony({ draftId: draftRef.id })
    console.log('pushing fake', r)
  }

  const fillFakeTestimony = async () => {
    const billIds = await getBillIds()
    billIds.sort(() => Math.random() - 0.5)
    await generateFakeTestimony(billIds.shift())

  }

  const republishDeletions = async () => {
    const refDTs = collection(firestore, `/users/${uid}/draftTestimony`)
    const refPTs = collection(firestore, `/users/${uid}/publishedTestimony`)
    const dts = await getDocs(refDTs)

    dts.forEach(async (d) => {
      console.log("refD", d.ref.id)
      const tst = await getDoc(doc(firestore, `/users/${uid}/draftTestimony/${d.ref.id}`))
      await updateDoc(d.ref, {
        attachmentId: null,
        editReason: "removed attachment"
      })
      const r = await publishTestimony({ draftId: d.ref.id })
    })

  }


  return (
    <div className="mb-4">
      <Row className="mt-0">
        <Col xs={8}>
          <TitledSectionCard className={className}>
            <Row>
              <Col>
                <h2>{t("testimonies.published")}</h2>
              </Col>
              <Col xs="auto">
                <SortTestimonyDropDown
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                />
              </Col>
            </Row>

            {publishedTestimonies &&
              publishedTestimonies
                .sort((a, b) =>
                  orderBy === "Oldest First"
                    ? a.publishedAt > b.publishedAt
                      ? 1
                      : -1
                    : a.publishedAt < b.publishedAt
                      ? 1
                      : -1
                )
                .map(t => (
                  <TestimonyItem
                    key={t.authorUid + t.billId}
                    testimony={t}
                    isUser={true}
                    onProfilePage={true}
                    canEdit={true}
                    canDelete={false}
                  />
                ))}
          </TitledSectionCard>
          <TitledSectionCard className={className}>
            <div>{process.env.NODE_ENV !== "production" && <Button onClick={fillFakeTestimony}>publishFakes</Button>}</div>
            <h2>{t("testimonies.draft")}</h2>
            {draftTestimonies &&
              draftTestimonies.map(t => (
                <TestimonyItem
                  key={t.authorUid + t.billId}
                  testimony={t}
                  isUser={true}
                  onProfilePage={true}
                  canEdit={true}
                  canDelete={false}
                />
              ))}
          </TitledSectionCard>
        </Col>
        <Col>
          <TestimonyFAQ className={className}></TestimonyFAQ>
        </Col>
      </Row>
    </div>
  )
}
