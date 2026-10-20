import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import { ConferenceTabs } from "./ConferenceTabs"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

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
})
