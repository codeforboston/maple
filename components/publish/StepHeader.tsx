import styled from "styled-components"

// The heading alone, flush with the content, with no step number or a column
// kept for one; the progress bar above already says which step this is.
export const StepHeader = styled(({ children }) => (
  <div className="mb-3" style={{ fontSize: "2rem" }}>
    {children}
  </div>
))``
