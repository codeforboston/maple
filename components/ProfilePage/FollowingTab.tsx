import clsx from "clsx"
import { ChangeEvent, useEffect, useState } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import styled from "styled-components"
import { Button, Col, Form, Image, Row, Stack } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { Header } from "../shared/TitledSectionCard"
import { ImageInput } from "./ImageInput"
import { YourLegislators } from "./YourLegislators"
import { formatBillId } from "../formatting"
import { billLink, billURL, External } from "../links"

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
}

export const Styled = styled.div`
  font-size: 2rem;
  a {
    display: inline-flex;
    align-items: baseline;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 600;
    font-size: 25px;
    line-height: 125%;
    /* or 31px */

    text-decoration-line: underline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export function FollowingTab({
  profile,
  actions,
  uid,
  className,
  setFormUpdated
}: Props) {
  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []

  console.log("P ", profile)
  console.log("local bills following: ", userBillList)

  return (
    <TitledSectionCard className={className}>
      <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
        <Stack>
          <h2>Bills You Follow</h2>
          {profile.billsFollowing?.map(bill => (
            <Styled key={bill.id}>
              <External href={billURL(bill.id)}>
                {formatBillId(bill.id)}
              </External>
              <Row>
                <Col className={`col-10`}>
                  <h6>{bill.title}</h6>
                </Col>
                <Col
                  className={`text-center`}
                  onClick={async () => {
                    userBillList = userBillList.filter(
                      item => item.id !== bill.id
                    )
                    await updateProfile({ actions })
                  }}
                >
                  <button
                    className={`btn btn-link d-flex align-items-start p-0 text-decoration-none`}
                  >
                    <h6>Unfollow</h6>
                  </button>
                </Col>
                <hr className={`mt-3`} />
              </Row>
            </Styled>
          ))}
        </Stack>
      </div>
    </TitledSectionCard>
  )
}

/*
FollowingTab -> [ ] make bill items responsive

Individual Bill Following Buttons -> [ ] remove bill number, add check icon when following
*/
