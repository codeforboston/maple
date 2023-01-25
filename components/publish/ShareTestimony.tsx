import { faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import { External, maple } from "components/links"
import { isNotNull } from "components/utils"
import { cloneDeep, fromPairs, isString, last, sortBy } from "lodash"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { components, GroupBase, MultiValueGenericProps } from "react-select"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { CopyButton } from "../buttons"
import { useMemberSearch } from "../db"
import { useProfileState } from "../db/profile/redux"
import { useAppDispatch } from "../hooks"
import { Loading, MultiSearch } from "../legislatorSearch"
import { calloutLabels } from "./content"
import { useFormRedirection, usePublishState, useTestimonyEmail } from "./hooks"
import * as nav from "./NavigationButtons"
import {
  addCommittee,
  addMyLegislators,
  clearLegislatorSearch,
  Legislator,
  resolvedLegislatorSearch,
  setRecipients,
  setShowThankYou
} from "./redux"
import { SendEmailButton } from "./SendEmailButton"
import { StepHeader } from "./StepHeader"
import { YourTestimony } from "./TestimonyPreview"

export const ShareTestimony = styled(({ ...rest }) => {
  useFormRedirection()
  useEmailRecipients()
  return (
    <div {...rest}>
      <StepHeader step={3}>Send Your Email</StepHeader>
      <p className="fw-bold mt-4">Let Your Voice Be Heard!</p>
      <YourTestimony className="position-relative">
        <CopyTestimony />
      </YourTestimony>
      <RecipientControls className="mt-5" />
      <SelectLegislatorEmails className="mt-2" />
      <nav.FormNavigation right={<ShareButtons />} />
    </div>
  )
})`
  .label-callout {
    font-size: 0.75rem;
    font-style: italic;
    text-align: center;
  }

  .leg-search__control {
    background-color: var(--bs-body-bg);
    border-color: var(--bs-body-bg);
    background-image: url("/mail-bg.svg");
    background-repeat: no-repeat;
    background-position: bottom right 20%;
    background-size: auto 6rem;
    min-height: 10rem;
    border-radius: 1rem;
  }

  .leg-search__value-container {
    padding: 0.5rem;
    align-self: flex-start;
  }

  .leg-search__multi-value {
    background-color: var(--bs-blue);
  }

  .leg-search__multi-value__label,
  .leg-search__multi-value__remove {
    color: white;
  }

  .leg-search__multi-value,
  .leg-search__multi-value__remove,
  .leg-search__control {
    border-radius: 1rem;
  }
`

const CopyTestimony = styled(props => {
  const email = useTestimonyEmail()
  return (
    <CopyButton
      variant="outline-secondary"
      text={email.body ?? ""}
      disabled={!email.body}
      className={clsx("copy-btn", props.className)}
    >
      <FontAwesomeIcon icon={faCopy} />
    </CopyButton>
  )
})`
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  width: 2rem;
  height: 2rem;
  padding: 0.25rem;
`

const EmailHelp = (props: { className?: string }) => {
  return (
    <External
      href="https://www.makeuseof.com/tag/how-to-change-the-default-email-program-for-mailto-links/"
      {...props}
    >
      Having trouble opening the email draft?
    </External>
  )
}

const RecipientControls = styled(({ className }) => {
  const dispatch = useAppDispatch()
  const { share } = usePublishState()

  const email = useTestimonyEmail()
  const buttons = []

  if (email.to)
    buttons.push(
      <CopyButton key="copy" variant="link" text={email.to}>
        <FontAwesomeIcon icon={faCopy} /> Copy Recipients
      </CopyButton>
    )

  if (share.committeeChairs.length > 0)
    buttons.push(
      <Button
        key="committee"
        variant="link"
        onClick={() => dispatch(addCommittee())}
      >
        Add Relevant Committee
      </Button>
    )

  if (share.userLegislators.length > 0)
    buttons.push(
      <Button
        key="legislators"
        variant="link"
        onClick={() => dispatch(addMyLegislators())}
      >
        Add My Legislators
      </Button>
    )

  return (
    <div className={clsx("d-flex gap-4 justify-content-end", className)}>
      {buttons}
    </div>
  )
})`
  button {
    font-size: 0.75rem;
    padding: 0;
    justify-self: flex-end;
  }
`

const Label = (
  props: MultiValueGenericProps<Legislator, true, GroupBase<Legislator>>
) => {
  const label = props.children
  const callout = props.data.callout
  return (
    <components.MultiValueLabel {...props}>
      {label}
      <div className="label-callout">{callout}</div>
    </components.MultiValueLabel>
  )
}

const SelectLegislatorEmails = ({ className }: { className?: string }) => {
  const { share } = usePublishState()
  const dispatch = useAppDispatch()
  return share.loading ? (
    <Loading />
  ) : (
    <MultiSearch
      className={className}
      placeholder="Find your legislators"
      index={share.options}
      memberIds={share.recipients.map(m => m.MemberCode)}
      update={m => dispatch(setRecipients(m))}
      getOptionLabel={o =>
        `${o.Branch === "House" ? "Rep." : "Sen."} ${o.Name} | ${o.District}`
      }
      components={{ MultiValueLabel: Label }}
    />
  )
}

const useEmailRecipients = () => {
  const { bill: { currentCommittee } = {} } = usePublishState()
  const { profile: { representative, senator } = {} } = useProfileState()
  const { index } = useMemberSearch()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(clearLegislatorSearch())
  }, [dispatch])

  useEffect(() => {
    if (!index) return

    const legislatorsById: Record<string, Legislator> = fromPairs(
      cloneDeep([...index.representatives, ...index.senators]).map(m => [
        m.MemberCode,
        m
      ])
    )

    const committeeCallouts = [
        [currentCommittee?.houseChair?.id, calloutLabels.houseChair],
        [currentCommittee?.senateChair?.id, calloutLabels.senateChair]
      ],
      userLegislatorsCallouts = [
        [representative?.id, calloutLabels.yourRepresentative],
        [senator?.id, calloutLabels.yourSenator]
      ],
      callouts = [...committeeCallouts, ...userLegislatorsCallouts]

    callouts.forEach(([id, callout]) => {
      if (!id) return
      const member = legislatorsById[id]
      if (member) {
        if (member.callout) member.callout += ", " + callout
        else member.callout = callout
      }
    })

    dispatch(
      resolvedLegislatorSearch({
        options: sortBy(Object.values(legislatorsById), m =>
          last(m.Name.split(" "))
        ),
        committeeChairs: committeeCallouts
          .map(([id]) => id)
          .filter(isString)
          .map(id => legislatorsById[id])
          .filter(isNotNull),
        userLegislators: userLegislatorsCallouts
          .map(([id]) => id)
          .filter(isString)
          .map(id => legislatorsById[id])
          .filter(isNotNull)
      })
    )
  }, [currentCommittee, dispatch, index, representative, senator])
}

const ShareButtons = () => {
  const { share, bill } = usePublishState()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const redirectToBill = useCallback(() => {
    dispatch(setShowThankYou(true))
    router.push(maple.bill(bill!))
  }, [bill, dispatch, router])
  const [sent, setSent] = useState(false)

  const buttons = []

  if (!share.loading && !sent) {
    buttons.push(
      <FinishWithoutEmailing
        key="finish-without-saving"
        onConfirm={redirectToBill}
      />
    )
  }

  if (sent) {
    buttons.push(
      <Button
        variant="outline-secondary"
        className="form-navigation-btn"
        onClick={redirectToBill}
      >
        Back to Bill
      </Button>
    )
  }

  if (share.recipients.length > 0) {
    buttons.push(
      <SendEmailButton
        key="send-email"
        className="form-navigation-btn"
        onClick={() => setSent(true)}
      />
    )
  }

  return (
    <div className="d-flex flex-column align-items-end">
      {sent && <EmailHelp className="mb-2 text-info" />}
      <div className="d-flex gap-2 flex-wrap">{buttons}</div>
    </div>
  )
}

export function FinishWithoutEmailing({
  onConfirm
}: {
  onConfirm: () => void
}) {
  const [show, setShow] = useState(false)
  const onHide = () => setShow(false)
  return (
    <>
      <Button
        variant="outline-secondary"
        className="form-navigation-btn"
        onClick={() => setShow(true)}
      >
        Finish Without Emailing
      </Button>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="sign-in-modal"
        centered
      >
        <Modal.Header>
          <Modal.Title id="sign-in-modal">Finish Without Emailing?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to finish without emailing your testimony?
            Engaging with your legislators helps them help you.
          </p>
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="outline-danger" onClick={onConfirm}>
            Yes, Finish Without Emailing
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Continue Sharing
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
