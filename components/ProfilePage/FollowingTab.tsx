import clsx from "clsx"
import { ChangeEvent, useEffect, useState } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Form, Image, Row, Col } from "../bootstrap"
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
  return (
    <TitledSectionCard className={className}>
      <Header title={"Following"} />
      <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
        {"Bills You Follow"}
      </div>
    </TitledSectionCard>
  )
}
