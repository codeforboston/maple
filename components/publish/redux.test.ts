import { configureStore } from "@reduxjs/toolkit"
import { validateStep } from "./hooks/navigation"
import { nextStep, previousStep, reducer as publish, setStep } from "./redux"

type StoreOptions = {
  ballotQuestionId?: string
  step?: "position" | "selectLegislators" | "write" | "publish" | "share"
  hasLegislators?: boolean
}

const makeStore = ({
  ballotQuestionId,
  step = "position",
  hasLegislators = false
}: StoreOptions = {}) => {
  const profile = hasLegislators
    ? ({ representative: { id: "rep" }, senator: { id: "sen" } } as any)
    : undefined

  return configureStore({
    reducer: {
      publish,
      profile: (state = { loading: false, profile }) => state
    },
    preloadedState: {
      publish: {
        ...publish(undefined, { type: "@@INIT" }),
        step,
        ballotQuestionId
      },
      profile: { loading: false, profile }
    } as any
  })
}

const currentStep = (store: ReturnType<typeof makeStore>) =>
  store.getState().publish.step

const makePublishState = (overrides: Record<string, unknown> = {}) =>
  ({
    ...publish(undefined, { type: "@@INIT" }),
    errors: {},
    sync: "synced",
    ...overrides
  } as any)

describe("publish flow steps", () => {
  it("keeps the existing bill flow order when legislators are not preloaded", async () => {
    const store = makeStore()

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("selectLegislators")

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("write")

    store.dispatch(setStep("publish"))
    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("share")
  })

  it("preserves the existing bill skip behavior when legislators are already known", async () => {
    const store = makeStore({ hasLegislators: true })

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("write")

    await store.dispatch(previousStep())
    expect(currentStep(store)).toBe("position")
  })

  it("uses the shorter ballot-question step order", async () => {
    const store = makeStore({ ballotQuestionId: "25-14" })

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("write")

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("publish")

    await store.dispatch(nextStep())
    expect(currentStep(store)).toBe("publish")

    await store.dispatch(previousStep())
    expect(currentStep(store)).toBe("write")
  })
})

describe("validateStep", () => {
  it("redirects ballot-question deep links away from selectLegislators", () => {
    expect(
      validateStep(
        makePublishState({
          step: "selectLegislators",
          ballotQuestionId: "25-14",
          position: "endorse",
          content: "Testimony"
        })
      )
    ).toBe("write")
  })

  it("redirects ballot-question deep links away from share", () => {
    expect(
      validateStep(
        makePublishState({
          step: "share",
          ballotQuestionId: "25-14",
          position: "endorse",
          content: "Testimony"
        })
      )
    ).toBe("publish")
  })
})
