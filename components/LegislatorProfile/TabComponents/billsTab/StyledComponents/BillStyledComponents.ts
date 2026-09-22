import styled from "styled-components";
import { Button, Table } from "react-bootstrap";
import { TabBlock } from "components/LegislatorProfile/LegislatorComponents";

export const StyledBillsTab = styled.div``

/* --- Subsection Headers For Containers ---*/
export const StyledSubSectionHeaders = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 1.5rem 0 0.75rem 0;
`

/* --- Bills By Topic Card Container --- */
export const StyledBillsByTopic = styled(TabBlock)`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 1.5rem;
`

export const StyledBillsByTopicHeader = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
`

export const StyledBillsByTopicHeaderTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`

export const StyledBillsByTopicHeaderSubtitle = styled.div`
  font-size: 0.8125rem;
  color: #64748b;
`



export const StyledTopicRow = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
`

export const StyledTopicName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.15rem;
`

export const StyledTopicMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`

export const StyledTopicLink = styled.a`
  font-size: 0.8125rem;
  color: #1c39bb;
  text-decoration: none;
  font-weight: 500;
`
export const StyledCountLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1c39bb;
  white-space: nowrap;
`
/* --- Subtopic Pill Tags --- */
export const StyledSubtopicContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`
export const StyledSubtopicTag = styled.div`
  display: inline-block;
  background-color: #1c39bb;
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  text-decoration: none;
  &:hover {
    background-color: #152c97;
  }
`

/* --- Tables (Bills & Committee Positions) --- */
export const StyledSubsectionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background-color: white;
`

export const StyledSubsectionTableColumnHeader = styled.th`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
`

export const StyledSubsectionTableColumnData = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
  vertical-align: middle;
`

export const StyledBillId = styled.div`
  font-weight: 700;
  color: #1c39bb;
`

export const StyledTitleCell = styled.div`
  color: #475569;
  max-width: 280px;
`

export const StyledBadge = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.785rem;
  font-weight: 600;
  border-radius: 9999px;
  text-align: center;
`

export const StyledMemberPill = styled.div``

export const StyledChairPill = styled.div``

/* --- Navigation Pill Filter Buttons --- */

export const StyledButtonFilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

export const StyledButtonBase = styled(Button)`
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
`

/* --- Footer Link Row --- */
export const StyledRecentBillsFooter = styled.div`
  display: block;
  text-align: center;
  padding: 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c39bb;
  border-top: 1px solid #f1f5f9;
  text-decoration: none;
  &:hover {
    background-color: #f8fafc;
    text-decoration: underline;
  }
`