import { isEqual } from "lodash"
import Router, { useRouter } from "next/router"
import { useEffect } from "react"
import { PublishState, resolveBill, usePublishState } from "."
import { createAppThunk, useAppDispatch } from "../../hooks"
import { setStep, Step } from "../redux"

export const formUrl = (
  billId: string,
  court: number,
  step: Step = "position"
) => `/submit-testimony?billId=${billId}&court=${court}&step=${step}`

/** Changes to the appropriate form step if users access a step that is
 * currently invalid (i.e. entering content before position, trying to share
 * unpublished testimony). */
export function useFormRedirection() {
  const dispatch = useAppDispatch()
  const state = usePublishState(),
    sync = state.sync,
    billId = state.bill?.id
  useEffect(() => {
    if (sync === "synced" && billId) {
      let newStep = validateStep(state)
      if (newStep) {
        dispatch(setStep(newStep))
      }
    }
  }, [billId, dispatch, state, sync])
}

type Validator = (state: PublishState) => Step | void
function validateStep(state: PublishState): Step | void {
  return validators[state.step](state)
}

const validators: Record<Step, Validator> = {
  position() {},
  selectLegislators(state) {
    return this.write(state)
  },
  write({ position, errors }) {
    if (!position || errors.position) return "position"
  },
  publish(state) {
    const positionError = this.write(state)
    if (positionError) return positionError
    if (!state.content || state.errors.content) return "write"
  },
  share(state) {
    const { publication } = state
    if (!publication) {
      const formError = this.publish(state)
      if (formError) return formError
      return "publish"
    }
  }
}

const stringOrUndefined = (s: any) => (typeof s === "string" ? s : undefined)
const numberOrUndefined = (s: any) =>
  !isNaN(Number(s)) ? Number(s) : undefined

/** Syncs changes between the store and the form URL. */
export const useSyncRouterAndStore = () => {
  const router = useRouter(),
    dispatch = useAppDispatch(),
    state = usePublishState()

  useEffect(() => {
    dispatch(routeChanged())
  }, [router.query.billId, dispatch, router.query.step])

  useEffect(() => {
    dispatch(storeChanged())
  }, [state.bill?.id, state.step, dispatch])
}

const routeChanged = createAppThunk(
  "publish/routeChanged",
  async (_, { getState, dispatch }) => {
    const route = currentRoute()

    const billId = getState().publish.bill?.id
    if (route.billId && route.billId !== billId) {
      await dispatch(resolveBill({ court: route.court, billId: route.billId }))
    }

    const step = getState().publish.step
    if (Step.guard(route.step) && route.step !== step) {
      dispatch(setStep(route.step))
    }
  }
)

const storeChanged = createAppThunk(
  "publish/storeChanged",
  async (_, { getState }) => {
    const state = getState(),
      billId = state.publish.bill?.id,
      step = state.publish.step,
      court = state.publish.bill?.court,
      route = currentRoute()

    if (billId && !isEqual(route, { billId, court, step })) {
      Router.push(`?billId=${billId}&court=${court}&step=${step}`, undefined, {
        shallow: true
      })
    }
  }
)

const currentRoute = () => ({
  court: numberOrUndefined(Router.query.court),
  billId: stringOrUndefined(Router.query.billId),
  step: stringOrUndefined(Router.query.step)
})
