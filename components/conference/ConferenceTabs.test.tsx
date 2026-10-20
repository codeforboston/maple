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
