import { usePublicProfile } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import { useTranslation } from "next-i18next"
import React, { useEffect, useMemo, useState } from "react"
import { Alert, Col, Row, Spinner, Stack } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { PaginationButtons } from "../table"
import { OrgIconSmall } from "./StyledEditProfileComponents"

export type LoadableList<T> = {
  items: readonly T[]
  loading: boolean
  error: string | null
}

export function PaginatedListCard<T>({
  className,
  title,
  items,
  itemsPerPage = 10,
  ItemCard,
  loading = false,
  error = null,
  description
}: {
  className?: string
  title: string | React.ReactNode
  items: readonly T[]
  itemsPerPage?: number
  ItemCard: React.ComponentType<T>
  loading?: boolean
  error?: string | null
  description?: React.ReactNode
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / itemsPerPage)),
    [items.length, itemsPerPage]
  )

  useEffect(() => {
    // Reset or clamp page when the list changes or page size changes
    setCurrentPage(prev => Math.min(Math.max(1, prev), totalPages))
  }, [items.length, itemsPerPage, totalPages])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  return (
    <TitledSectionCard className={className}>
      <div className="mx-4 mt-3 d-flex flex-column gap-3">
        <Stack>
          <h2>{title}</h2>
          {description && <div className="mt-0 text-muted">{description}</div>}
          <div className="mt-3">
            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : loading ? (
              <Spinner animation="border" className="mx-auto" />
            ) : (
              paginatedItems.map((item, index) => (
                <ItemCard key={index} {...item} />
              ))
            )}
          </div>
          {!loading && items.length > 0 && (
            <PaginationButtons
              pagination={{
                currentPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
                nextPage: () => setCurrentPage(prev => prev + 1),
                previousPage: () => setCurrentPage(prev => prev - 1),
                itemsPerPage
              }}
            />
          )}
        </Stack>
      </div>
    </TitledSectionCard>
  )
}

export function FollowUserItem({ profileId }: { profileId: string }) {
  const { result: profile, loading } = usePublicProfile(profileId)
  const { t } = useTranslation("profile")

  if (loading) {
    return (
      <div className={`fs-3 lh-lg`}>
        <Row className="align-items-center justify-content-between g-0 w-100">
          <Spinner animation="border" className="mx-auto" />
        </Row>
        <hr className={`mt-3`} />
      </div>
    )
  }

  const { fullName, profileImage, public: isPublic } = profile || {}
  const displayName = isPublic && fullName ? fullName : t("anonymousUser")

  return (
    <div className={`fs-3 lh-lg`}>
      <Row className="align-items-center justify-content-between g-0 w-100">
        <Col className="d-flex align-items-center flex-grow-1 p-0 text-start">
          <OrgIconSmall
            className="mr-4 mt-0 mb-0 ms-0"
            profileImage={profileImage}
          />
          {isPublic ? (
            <Internal href={`/profile?id=${profileId}`}>{displayName}</Internal>
          ) : (
            <span>{displayName}</span>
          )}
        </Col>
        {isPublic ? (
          <Col xs="auto" className="d-flex justify-content-end ms-auto p-0">
            <FollowUserButton profileId={profileId} />
          </Col>
        ) : null}
      </Row>
      <hr className={`mt-3`} />
    </div>
  )
}
