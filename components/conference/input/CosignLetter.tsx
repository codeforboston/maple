import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { AccountTypeIcon } from "./Pickers"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { Disc, filedOn, PositionChip } from "./Entry"
import { Paper, Well } from "../ConferenceText"
import { FULL_LAYOUT, MOBILE_LAYOUT } from "../styles"
import { ink, line, recess } from "./tokens"

/** Over the whole window but still beside the form (from mobile to lg), where
 * the sheet is narrowest. */
const NARROW_BESIDE = "(min-width: 768px) and (max-width: 1023.98px)"

/** The same well the bill text sits in, holding the one sheet. Beside the
 * form it takes the room there and rises into the header's band, empty on
 * this side of the panel; on mobile, over the form, it is as tall as the
 * sheet, up to three quarters of the window, the sheet scrolling in it past
 * that. */
const Tray = styled(Well)`
  flex: 1;
  min-height: 0;
  height: auto;
  margin-top: 0;
  /* The panel's grey, not the bill text's. */
  background: ${recess};

  @media ${MOBILE_LAYOUT} {
    max-height: 75vh;
  }
  @media ${FULL_LAYOUT} {
    margin-top: -48px;
  }
`

/** Room under the words, more than the bill text's sheets keep. Over the
 * whole window but still beside the form (from mobile to lg, where the panel
 * is a sheet), where its column is narrowest, a tighter margin at the top
 * and sides. */
const Sheet = styled(Paper)`
  flex: 1 1 auto;
  padding-bottom: 3.5rem;

  @media ${NARROW_BESIDE} {
    padding-top: 1.25rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
`

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${line.default};

  @media ${NARROW_BESIDE} {
    flex-wrap: wrap;
    row-gap: 4px;
  }
`

/** Doubled (&&) so it holds over Disc's own size whatever order the styles
 * load in. */
const Portrait = styled(Disc)`
  && {
    --disc: 44px;
  }
`

const Name = styled.p`
  /* Names in Lexend, as the cosign card's, in Nunito cards too. */
  font-family: var(--maple-font-heading);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 400;
  color: ${ink.strong};

  .position-chip {
    font-size: 0.75rem;
  }
`

const Descriptor = styled.p`
  margin: 2px 0 0;
  font-size: 0.8125rem;
  color: ${ink.faint};
`

/** The date, at the head's end; where the sheet is narrowest, on a line of
 * its own under the name, in line with it past the portrait (44px) and the
 * gap (12px). */
const When = styled.p`
  flex-shrink: 0;
  margin: 0;
  font-size: 0.8125rem;
  color: ${ink.mid};

  @media ${NARROW_BESIDE} {
    flex-basis: 100%;
    padding-left: 56px;
  }
`

/** The words; where the sheet is narrowest, kept in from its edges a little
 * more than the head over them (24px a side in all). */
const Words = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: ${ink.strong};
  white-space: pre-line;

  @media ${NARROW_BESIDE} {
    padding: 0 0.5rem;
  }
`

/** What is being cosigned, whole, to read beside the form that signs it, in
 * the type of the entries in Public Input (Entry.tsx). */
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
