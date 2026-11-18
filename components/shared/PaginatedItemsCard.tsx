import React, { useEffect, useMemo, useState } from "react"
import { Alert, Spinner, Stack } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { PaginationButtons } from "../table"

export type LoadableItemsState<T extends object> = {
  items: readonly T[]
  loading: boolean
  error: string | null
}

export function PaginatedItemsCard<T extends object>({
  className,
  title,
  items,
  itemsPerPage = 10,
  ItemCard,
  loading = false,
  error = null,
  description,
  titleInHeader = false
}: LoadableItemsState<T> & {
  className?: string
  title: string | React.ReactNode
  itemsPerPage?: number
  ItemCard: React.ComponentType<T>
  description?: React.ReactNode
  /** The title in the card's header band, as on the profile page's cards,
   * with the card's own padding, rather than as a heading inside. Edit
   * Profile turns it on. Off by default. */
  titleInHeader?: boolean
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
    <TitledSectionCard
      className={className}
      title={titleInHeader && typeof title === "string" ? title : undefined}
    >
      <div
        className={
          titleInHeader
            ? "d-flex flex-column gap-3"
            : "mx-4 mt-3 d-flex flex-column gap-3"
        }
      >
        <Stack>
          {!titleInHeader && <h2>{title}</h2>}
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
