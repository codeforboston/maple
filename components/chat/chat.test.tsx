import { render, screen } from "@testing-library/react"
import messages from "../../public/locales/en/chat.json"
import {
  ALLOWED_ELEMENTS,
  AnswerMarkdown,
  BillLinkOnly,
  CappedList,
  plainText
} from "./AnswerMarkdown"
import { chamberOf, formatBillNumber } from "./ChamberChip"
import { billSearchUrl } from "./links"
import { TestimonySplit } from "./TestimonySplit"

// Real chat.json strings with {{var}} interpolation, so tests read what users see.
jest.mock("next-i18next", () => {
  const msgs = jest.requireActual("../../public/locales/en/chat.json")
  return {
    useTranslation: () => ({
      t: (key: string, vars: Record<string, unknown> = {}) => {
        const s = key.split(".").reduce((o: any, k) => o?.[k], msgs)
        return typeof s === "string"
          ? s.replace(/{{(\w+)}}/g, (_, v) => String(vars[v]))
          : key
      }
    })
  }
})

const markdownProps = jest.fn()
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: (props: any) => {
    markdownProps(props)
    return <div>{props.children}</div>
  }
}))

describe("AnswerMarkdown", () => {
  test("only paragraphs, bold, links and lists render as elements; the rest unwrap to text", () => {
    render(<AnswerMarkdown text="## Heading" />)
    const props = markdownProps.mock.calls.at(-1)[0]
    expect(props.unwrapDisallowed).toBe(true)
    expect(props.allowedElements).toEqual(ALLOWED_ELEMENTS)
    for (const tag of [
      "h1",
      "h2",
      "h3",
      "table",
      "td",
      "pre",
      "code",
      "img",
      "hr",
      "blockquote"
    ])
      expect(ALLOWED_ELEMENTS).not.toContain(tag)
  })

  test("bullet lists stop at five items", () => {
    const items = ["1", "2", "3", "4", "5", "6"].flatMap(n => [
      "\n",
      <li key={n}>{n}</li>
    ])
    render(<CappedList>{items}</CappedList>)
    expect(screen.getAllByRole("listitem").map(li => li.textContent)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5"
    ])
  })

  test("a partial answer is marked incomplete", () => {
    render(<AnswerMarkdown text="Partial" incomplete />)
    expect(screen.getByText(messages.answer.incomplete)).toBeTruthy()
  })
})

describe("TestimonySplit", () => {
  test("exposes a text equivalent of the bar", () => {
    render(
      <TestimonySplit counts={{ support: 287, oppose: 98, neutral: 27 }} />
    )
    expect(
      screen.getByRole("img", {
        name: "Testimony: 287 support, 98 oppose, 27 neutral"
      })
    ).toBeTruthy()
  })

  test("no bar when nobody has testified", () => {
    render(<TestimonySplit counts={{ support: 0, oppose: 0, neutral: 0 }} />)
    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.getByText(messages.split.none)).toBeTruthy()
  })
})

test("bill ids format the way MAPLE shows them", () => {
  expect(formatBillNumber("H1440")).toBe("H.1440")
  expect(formatBillNumber("S886")).toBe("S.886")
  expect(chamberOf("S886")).toBe("senate")
  expect(chamberOf("H1440")).toBe("house")
})

test("search-all link carries the question into MAPLE's bill search", () => {
  expect(billSearchUrl("bike lanes & rent")).toBe(
    "/bills?bills%5Bquery%5D=bike%20lanes%20%26%20rent"
  )
})

test("answer links: MAPLE bill pages stay links; any other URL becomes plain text", () => {
  const { container } = render(
    <>
      <BillLinkOnly href="/bills/192/H1440">H.1440</BillLinkOnly>
      <BillLinkOnly href="https://evil.example/bills/192/H1440">
        fake
      </BillLinkOnly>
      <BillLinkOnly href="/bills/192/H1440/../../login">sneaky</BillLinkOnly>
      <BillLinkOnly href="javascript:alert(1)">js</BillLinkOnly>
    </>
  )
  const links = [...container.querySelectorAll("a")].map(a =>
    a.getAttribute("href")
  )
  expect(links).toEqual(["/bills/192/H1440"])
  expect(container.textContent).toContain("fake")
})

test("the screen-reader announcement drops markdown syntax", () => {
  expect(
    plainText(
      "[H.742](/bills/194/H742) is in the **Joint Committee**.\n- one\n- two"
    )
  ).toBe("H.742 is in the Joint Committee.\none\ntwo")
})
