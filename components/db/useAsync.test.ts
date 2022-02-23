import { waitFor } from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"
import { useAsync } from "react-async-hook"

const callback1 = async () => 1
const callback2 = async () => 2

test("useAsync does not update when the callback changes", async () => {
  const hook = renderHook((cb: any) => useAsync(cb, []), {
    initialProps: callback1
  })

  await waitFor(() => expect(hook.result.current.result).toBe(1))
  hook.rerender(callback2)
  expect(hook.result.current.result).toBe(1)
})

test("useAsync updates when dependencies change", async () => {
  const hook = renderHook((cb: any) => useAsync(cb, [cb]), {
    initialProps: callback1
  })

  await waitFor(() => expect(hook.result.current.result).toBe(1))
  const result1 = hook.result.current
  hook.rerender(callback2)
  const result2 = hook.result.current
  await waitFor(() => expect(hook.result.current.result).toBe(2))
  expect(result1).not.toBe(result2)
})
