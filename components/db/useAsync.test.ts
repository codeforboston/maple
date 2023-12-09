import { waitFor, act, renderHook } from "@testing-library/react"
import { useAsync, useAsyncCallback } from "react-async-hook"

const callback1 = async () => 1
const callback2 = async () => 2

test("useAsync does not update when the callback changes", async () => {
  // eslint-disable-next-line
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

test("useAsyncCallback waits for execute to update when the callback changes", async () => {
  const { result, rerender } = renderHook(
    (cb: any) => useAsyncCallback(cb),
    {
      initialProps: callback1
    }
  )

  act(() => void result.current.execute())
  await waitFor(() => expect(result.current.result).toBe(1))

  rerender(callback2)
  expect(result.current.result).toBe(1)
  act(() => void result.current.execute())
  await waitFor(() => expect(result.current.result).toBe(2))
})
