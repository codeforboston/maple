export const DescriptionBox = ({ description }: { description: string }) => {
  return (
    <div
      className="rounded border px-3 py-3"
      style={{
        backgroundColor: "var(--bs-blue-100)",
        borderColor: "var(--bs-blue-300)"
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h6 className="mb-2 fw-semibold">What this question would do:</h6>
          <p className="mb-0 small text-body-secondary">{description}</p>
        </div>
        <span className="text-muted small">○</span>
      </div>
    </div>
  )
}
