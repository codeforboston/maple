import { faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import { cloneDeep, fromPairs, isString, last, sortBy } from "lodash"
import { useEffect } from "react"
import { components, GroupBase, MultiValueGenericProps } from "react-select"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Row } from "../bootstrap"
import { CopyButton } from "../buttons"
import { useMemberSearch } from "../db"
import { useProfileState } from "../db/profile/redux"
import { useAppDispatch } from "../hooks"
import { Loading, MultiSearch } from "../legislatorSearch"
import { calloutLabels } from "./content"
import { usePublishState, useTestimonyEmail } from "./hooks"
import {
  addCommittee,
  removeCommittee,
  addMyLegislators,
  removeMyLegislators,
  clearLegislatorSearch,
  Legislator,
  resolvedLegislatorSearch,
  setRecipients
} from "./redux"
import { isNotNull } from "components/utils"

export const SelectRecipients = styled(props => {
  useEmailRecipients()
  const email = useTestimonyEmail()

  const isMobile = useMediaQuery("(max-width: 1199px)")

  return (
    <div {...props}>
      <Row className="d-flex">
        <Col className="align-self-center fs-4" xl={3} lg={12}>
          Email Recipients
        </Col>
        <Col xl={6} lg={12}>
          <RecipientControls />
        </Col>
        <Col
          className={`align-self-center ${isMobile ? "py-2" : ""}`}
          xl={3}
          lg={12}
        >
          {email.to ? (
            <CopyButton
              key="copy"
              variant="outline-secondary"
              text={email.to}
              className={`copy py-1 px-2 ${isMobile ? "ms-3" : ""}`}
              format="text/plain"
            >
              <FontAwesomeIcon icon={faCopy} /> Copy Email Recipients
            </CopyButton>
          ) : null}
        </Col>
      </Row>
      <SelectLegislatorEmails className="my-2" />
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
    background-image: url("/mail.svg");
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

const RecipientControls = styled(({ className }) => {
  const dispatch = useAppDispatch()
  const { share } = usePublishState()

  const email = useTestimonyEmail()
  const buttons = []

  const isMobile = useMediaQuery("(max-width: 1199px)")

  if (share.committeeChairs.length > 0) {
    const committeeChairsCodes = share.committeeChairs.map(
      item => item.MemberCode
    )
    if (
      share.recipients.filter(m => committeeChairsCodes.includes(m.MemberCode))
        .length < share.committeeChairs.length
    ) {
      buttons.push(
        <Col
          className={`align-self-center ${isMobile ? "ms-3 my-1" : ""}`}
          xl={6}
          lg={12}
        >
          <Button
            className="py-1"
            key="committee"
            // variant="link"
            variant="outline-secondary"
            onClick={() => dispatch(addCommittee())}
          >
            Add Relevant Committee Chairs
          </Button>
        </Col>
      )
    } else {
      buttons.push(
        <Col
          className={`align-self-center ${isMobile ? "ms-3 my-1" : ""}`}
          xl={6}
          lg={12}
        >
          <Button
            className="py-1"
            key="committee"
            // variant="link"
            variant="outline-secondary"
            onClick={() => dispatch(removeCommittee())}
          >
            Remove Relevant Committee Chairs
          </Button>
        </Col>
      )
    }
  }

  if (share.userLegislators.length > 0) {
    const userLegislatorsCodes = share.userLegislators.map(
      item => item.MemberCode
    )
    if (
      share.recipients.filter(m => userLegislatorsCodes.includes(m.MemberCode))
        .length < share.userLegislators.length
    ) {
      buttons.push(
        <Col
          className={`align-self-center ${isMobile ? "mb-1 ms-3 mt-2" : ""}`}
          xl={6}
          lg={12}
        >
          <Button
            className="py-1"
            key="legislators"
            // variant="link"
            variant="outline-secondary"
            onClick={() => dispatch(addMyLegislators())}
          >
            Add My Legislators
          </Button>
        </Col>
      )
    } else {
      buttons.push(
        <Col
          className={`align-self-center ${isMobile ? "mb-1 ms-3 mt-2" : ""}`}
          xl={6}
          lg={12}
        >
          <Button
            className="py-1"
            key="legislators"
            // variant="link"
            variant="outline-secondary"
            onClick={() => dispatch(removeMyLegislators())}
          >
            Remove My Legislators
          </Button>
        </Col>
      )
    }
  }

  return <Row>{buttons}</Row>
})`
  flex-wrap: wrap;

  .copy {
    padding: 0.25rem 0.5rem;
  }

  button:not(.copy) {
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
