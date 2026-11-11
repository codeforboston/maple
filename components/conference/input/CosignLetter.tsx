import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { AccountTypeIcon } from "./Pickers"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { Disc, filedOn, PositionChip } from "./Entry"
import { Paper, Well } from "../ConferenceText"
import { ink, line } from "./tokens"

/** The same well the bill text sits in, holding the one sheet. It takes the
 * room the form leaves it, and at lg rises into the header's band, empty on
 * this side of the panel. */
const Tray = styled(Well)`
  flex: 1;
  min-height: 0;
  height: auto;
  margin-top: 0;

  @media (min-width: 1024px) {
    margin-top: -48px;
  }
`

const Sheet = styled(Paper)`
  flex: 1 1 auto;
`

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${line.default};
`

const Portrait = styled(Disc)`
  width: 44px;
  height: 44px;
`

const Name = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${ink.strong};
`

const Descriptor = styled.p`
  margin: 2px 0 0;
  font-size: 0.8125rem;
  color: ${ink.faint};
`

const When = styled.p`
  flex-shrink: 0;
  margin: 0;
  font-size: 0.75rem;
  color: ${ink.mid};
`

const Words = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: ${ink.strong};
  white-space: pre-line;
`

/** What is being cosigned, whole, to read beside the form that signs it. */
export function CosignLetter({ parent }: { parent: ConferenceTestimony }) {
  const { t, i18n } = useTranslation("conferences")
  const type = accountTypeOf(parent.authorRole)
  const name = nameOf(parent)
  return (
    <Tray>
      <Sheet>
        <Head>
          <Portrait>{initialsOf(name)}</Portrait>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Name>
              {name}
              <AccountTypeIcon type={type} />
              <PositionChip position={parent.position} />
            </Name>
            <Descriptor>{t(`input.descriptor_${type}`)}</Descriptor>
          </div>
          <When>{filedOn(parent, i18n.language)}</When>
        </Head>
        <Words>{parent.content}</Words>
      </Sheet>
    </Tray>
  )
}
