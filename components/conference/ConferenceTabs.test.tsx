import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { ConferenceTabs } from "./ConferenceTabs"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))
jest.mock("./navbar", () => ({ jumpTo: jest.fn() }))

// jsdom has none; the row watches the column its sections sit in.
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: Observer })

describe("ConferenceTabs", () => {
  it("leaves out a row with one section, which has nothing to choose", () => {
    const { container } = render(<ConferenceTabs sections={["committee"]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("lights the tab below a block with no tab once the one above has gone", () => {
    // Committee has scrolled away; the reader's own input, with no tab, is
    // under the bar and Public Input is still below it.
    const box = (top: number, bottom: number) => () =>
      ({ top, bottom } as DOMRect)
    const page = document.createElement("main")
    for (const [id, top, bottom] of [
      ["committee", -900, -100],
      ["your-input", -76, 300],
      ["input", 324, 1200]
    ] as const) {
      const el = document.createElement("section")
      el.id = id
      el.getBoundingClientRect = box(top, bottom)
      page.append(el)
    }
    document.body.append(page)
    const { getByText } = render(
      <ConferenceTabs sections={["committee", "input"]} />
    )
    expect(getByText("tab_input")).toHaveAttribute("aria-current", "true")
    expect(getByText("tab_committee")).not.toHaveAttribute("aria-current")
    page.remove()
  })

  it("keeps Next's state on a tab click, its as path taking the hash", () => {
    document.body.innerHTML = `<div><section id="committee"></section><section id="text"></section></div>`
    const as = "/conferences/194/pet-equity"
    history.replaceState({ as, key: "k" }, "", as)
    render(<ConferenceTabs sections={["committee", "text"]} />)
    fireEvent.click(screen.getByText("tab_text"))
    expect(history.state).toEqual({ as: `${as}#text`, key: "k" })
    expect(location.hash).toBe("#text")
  })
})
