import AwesomeDebouncePromise from "awesome-debounce-promise"
import { useCallback, useMemo, useState } from "react"
import { GroupBase } from "react-select"
import AsyncSelect, { AsyncProps } from "react-select/async"
import { Form } from "../bootstrap"

export type SetFilter<T> = (filter: T | null) => void
export type LoadOptions<T> = (value: string) => Promise<T[]>
export type ItemSearchProps<T, F> = AsyncProps<T, false, GroupBase<T>> & {
  loadOptions: LoadOptions<T>
  getFilterOption: (i: T) => F
  setFilter: SetFilter<F>
}

export function ItemSearch<T, F>({
  loadOptions,
  getFilterOption,
  setFilter,
  ...props
}: ItemSearchProps<T, F>) {
  const { debouncedLoadOptions, error } = useDebouncedLoadOptions(loadOptions)
  const { defaults, loadDefaults, loading } = useDefaultOptions(loadOptions)
  return (
    <div className="mb-3">
      <AsyncSelect
        {...props}
        instanceId="item-search"
        isClearable
        onFocus={loadDefaults}
        defaultOptions={defaults}
        isLoading={loading ? true : undefined}
        blurInputOnSelect
        loadOptions={debouncedLoadOptions}
        onChange={i => setFilter(i ? getFilterOption(i) : null)}
      />
      {error && (
        <Form.Text className="text-danger">
          Search error. Please try again.
        </Form.Text>
      )}
    </div>
  )
}

const useDebouncedLoadOptions = <T,>(loadOptions: LoadOptions<T>) => {
  const [error, setError] = useState(false)
  const debouncedLoadOptions = useMemo(
    () =>
      AwesomeDebouncePromise(async (value: string) => {
        try {
          const options = await loadOptions(value)
          setError(false)
          return options
        } catch (e) {
          console.warn("Search error", e)
          setError(true)
        }
      }, 100),
    [loadOptions]
  )
  return { error, debouncedLoadOptions }
}

const useDefaultOptions = <T,>(loadOptions: LoadOptions<T>) => {
  const [defaults, setDefaults] = useState<any>(undefined)
  const [loading, setLoadingDefaults] = useState(false)
  const loadDefaults = useCallback(() => {
    if (!defaults && !loading) {
      setLoadingDefaults(true)
      loadOptions("")
        .then(options => {
          setLoadingDefaults(false)
          setDefaults(options)
        })
        .catch(e => {
          console.warn("Search defaults error", e)
          setLoadingDefaults(false)
        })
    }
  }, [defaults, loadOptions, loading])
  return { loadDefaults, loading, defaults }
}
