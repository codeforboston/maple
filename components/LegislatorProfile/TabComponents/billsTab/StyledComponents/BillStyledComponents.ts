import styled from "styled-components";
import { Button } from "react-bootstrap";
import { TabBlock } from "components/LegislatorProfile/LegislatorComponents";

export const StyledBillsTab = styled.div``

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

export const StyledSubSectionHeaders = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 1.5rem 0 0.75rem 0;
`

export const StyledSubsectionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
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