import { Trans, useTranslation } from "next-i18next"
import { FormEvent, useId, useState } from "react"
import { Button, Form, Spinner } from "../bootstrap"
import { MemberSearchIndex } from "../db"
import { External } from "../links"
import {
  decideCandidate,
  DistrictsNotFoundError,
  LegislatorLookupResult,
  lookUpLegislators,
  Seat
} from "./lookup"
import { AddressCandidate, geocodeAddress } from "./massgis"

export const FIND_MY_LEGISLATOR_URL =
  "https://malegislature.gov/Search/FindMyLegislator"

type Status =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "choose"; candidates: AddressCandidate[] }
  | { kind: "found"; result: LegislatorLookupResult }
  | {
      kind:
        | "needsTown"
        | "needsHouseNumber"
        | "notFound"
        | "unavailable"
        | "saveFailed"
    }

export type AddressLookupProps = {
  index: MemberSearchIndex
  /** Called with the legislators for the address, to save them. A seat with
   * no member (a vacancy) is passed as null. */
  onFound: (result: LegislatorLookupResult) => Promise<unknown> | void
}

/** An address box that finds the user's state representative and senator
 * and hands them to `onFound`. Sits above the representative and senator
 * pickers, which stay available for choosing by hand. */
export const AddressLookup = ({ index, onFound }: AddressLookupProps) => {
  const { t } = useTranslation("editProfile")
  const inputId = useId()
  const chooseId = useId()
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const busy = status.kind === "busy"

  const locate = async (candidate: AddressCandidate) => {
    setStatus({ kind: "busy" })
    let result: LegislatorLookupResult
    try {
      result = await lookUpLegislators(candidate, index)
    } catch (e) {
      setStatus({
        kind: e instanceof DistrictsNotFoundError ? "notFound" : "unavailable"
      })
      return
    }
    try {
      await onFound(result)
      setStatus({ kind: "found", result })
    } catch {
      setStatus({ kind: "saveFailed" })
    }
  }

  const search = async (event: FormEvent) => {
    event.preventDefault()
    const query = address.trim()
    if (!query || busy) return

    setStatus({ kind: "busy" })
    let decision
    try {
      decision = decideCandidate(await geocodeAddress(query), query)
    } catch {
      setStatus({ kind: "unavailable" })
      return
    }
    switch (decision.kind) {
      case "match":
        return locate(decision.candidate)
      case "choose":
        return setStatus({ kind: "choose", candidates: decision.candidates })
      default:
        return setStatus({ kind: decision.kind })
    }
  }

  const headingLabel = {
    className: "h6",
    style: { fontFamily: "var(--maple-font-heading)" }
  }

  return (
    <Form onSubmit={search} className="mb-4" role="search">
      <Form.Label htmlFor={inputId} {...headingLabel}>
        {t("legislator.lookup.label")}
      </Form.Label>
      <div className="d-flex flex-wrap gap-2">
        <Form.Control
          id={inputId}
          type="text"
          autoComplete="street-address"
          placeholder={t("legislator.lookup.placeholder")}
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="flex-grow-1 w-auto"
          style={{ minWidth: "12rem" }}
        />
        <Button type="submit" disabled={busy || !address.trim()}>
          {busy ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {t("legislator.lookup.searching")}
            </>
          ) : (
            t("legislator.lookup.find")
          )}
        </Button>
      </div>
      <Form.Text muted>{t("legislator.lookup.privacy")}</Form.Text>

      <div aria-live="polite" className="mt-2">
        {status.kind === "found" && <Found result={status.result} />}

        {status.kind === "choose" && (
          <div role="group" aria-labelledby={chooseId}>
            <p id={chooseId} className="mb-2">
              {t("legislator.lookup.choose")}
            </p>
            <div className="d-grid gap-2">
              {status.candidates.map(candidate => (
                <Button
                  key={candidate.address}
                  variant="outline-secondary"
                  size="sm"
                  className="text-start"
                  onClick={() => locate(candidate)}
                >
                  {candidate.address}
                </Button>
              ))}
            </div>
            <p className="small text-muted mt-2 mb-0">
              {t("legislator.lookup.noneOfThese")}
            </p>
          </div>
        )}

        {(status.kind === "needsTown" ||
          status.kind === "needsHouseNumber" ||
          status.kind === "notFound" ||
          status.kind === "saveFailed") && (
          <p className="text-danger mb-0">
            {t(`legislator.lookup.${status.kind}`)}
          </p>
        )}

        {status.kind === "unavailable" && (
          <p className="text-danger mb-0">
            <Trans
              t={t}
              i18nKey="legislator.lookup.unavailable"
              components={[
                // eslint-disable-next-line react/jsx-key
                <External href={FIND_MY_LEGISLATOR_URL} />
              ]}
            />
          </p>
        )}
      </div>
    </Form>
  )
}

const Found = ({ result }: { result: LegislatorLookupResult }) => {
  const { t } = useTranslation("editProfile")
  const seats: [Seat, string][] = [
    [result.representative, t("legislator.lookup.house")],
    [result.senator, t("legislator.lookup.senate")]
  ]
  return (
    <>
      <p className="mb-0">
        <Trans
          t={t}
          i18nKey="legislator.lookup.found"
          values={{ address: result.address }}
          components={[
            // eslint-disable-next-line react/jsx-key
            <strong />
          ]}
        />
      </p>
      {seats
        .filter(([seat]) => !seat.member)
        .map(([seat, chamber]) => (
          <p key={chamber} className="mb-0 mt-1">
            {t("legislator.lookup.vacant", {
              chamber,
              district: seat.district
            })}
          </p>
        ))}
    </>
  )
}
