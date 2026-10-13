import { GetStaticProps } from "next"
import Link from "next/link"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { Container, Table } from "components/bootstrap"
import { createPage } from "components/page"
import hearingsData from "public/data/hearings.json"

type Hearing = {
  hid: number
  title: string
  date: string
  chamber: string
  type: string
  bills_discussed: string | null
}

const hearings = hearingsData.data.hearings as Hearing[]

// bills_discussed lists one bill per line, using inconsistent \n / \r\n separators
const splitBillsDiscussed = (billsDiscussed: string | null) =>
  billsDiscussed
    ?.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean) ?? []

const BrowseHearingsPage = createPage({
  titleI18nKey: "navigation.browseHearings",
  Page: () => {
    const { t } = useTranslation("hearing")

    return (
      <Container fluid="md" className="mt-3">
        <h1>{t("navigation.browseHearings", { ns: "common" })}</h1>
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>{t("title")}</th>
              <th>{t("date")}</th>
              <th>{t("chamber")}</th>
              <th>{t("type")}</th>
              <th>{t("bills_discussed")}</th>
            </tr>
          </thead>
          <tbody>
            {hearings.map(hearing => (
              <tr key={hearing.hid}>
                <td>
                  <Link href={`/hearings/${hearing.hid}`}>{hearing.title}</Link>
                </td>
                <td>{hearing.date}</td>
                <td>{hearing.chamber}</td>
                <td>{hearing.type}</td>
                <td>
                  {splitBillsDiscussed(hearing.bills_discussed).map(
                    (line, i) => (
                      <div key={i}>{line}</div>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    )
  }
})

export default BrowseHearingsPage

export const getStaticProps: GetStaticProps = async ctx => {
  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "hearing"
      ]))
    }
  }
}
