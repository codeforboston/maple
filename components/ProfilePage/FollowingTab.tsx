import clsx from "clsx"
import { ChangeEvent, useEffect, useState } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Col, Form, Image, Row } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { Header } from "../shared/TitledSectionCard"
import { ImageInput } from "./ImageInput"
import { YourLegislators } from "./YourLegislators"
import { Internal } from "../links"

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
}

export function FollowingTab({
  profile,
  actions,
  uid,
  className,
  setFormUpdated
}: Props) {
  console.log("P ", profile)

  return (
    <TitledSectionCard className={className}>
      <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
        <Col>
          <h2>Bills You Follow</h2>
          {profile.billsFollowing?.map(bill => (
            <Row key={bill.id}>{bill.id}</Row>
          ))}
        </Col>
      </div>
    </TitledSectionCard>
  )
}
