import { CollectionVersionInputs, searchCollectionName } from "./collectionName"

const base: CollectionVersionInputs = {
  alias: "widgets",
  schema: {
    fields: [
      { name: "name", type: "string", facet: false },
      { name: "count", type: "int32" }
    ],
    default_sorting_field: "count"
  },
  convert: (data: any) => ({ id: data.id, name: data.name, count: data.count })
}

describe("searchCollectionName", () => {
  /** Pinned so that adding a key to the hashed object — the easy mistake, since
   * it renames every collection at once and forces a full backfill of each —
   * fails here rather than in production. Only `base` above, or something that
   * changes how it is formatted or transpiled, should move this literal.
   */
  it("hashes a fixed config to a stable name", () => {
    expect(searchCollectionName(base)).toEqual(
      "widgets_8efb32501b99da0cd32c2ef16fe735c7"
    )
  })

  it("distinguishes collections by alias", () => {
    expect(searchCollectionName({ ...base, alias: "gadgets" })).not.toEqual(
      searchCollectionName(base)
    )
  })

  it("changes when the schema changes", () => {
    const schema = {
      ...base.schema,
      fields: [
        ...base.schema.fields,
        { name: "color", type: "string" as const }
      ]
    }
    expect(searchCollectionName({ ...base, schema })).not.toEqual(
      searchCollectionName(base)
    )
  })

  it("changes when convert's own source changes", () => {
    const convert = (data: any) => ({
      id: data.id,
      name: data.name.trim(),
      count: data.count
    })
    expect(searchCollectionName({ ...base, convert })).not.toEqual(
      searchCollectionName(base)
    )
  })

  it("changes when a filter is added or edited", () => {
    const filtered = { ...base, filter: (data: any) => data.count > 0 }
    expect(searchCollectionName(filtered)).not.toEqual(
      searchCollectionName(base)
    )
    expect(
      searchCollectionName({ ...base, filter: (data: any) => data.count > 1 })
    ).not.toEqual(searchCollectionName(filtered))
  })

  /** The reason convertVersion exists: convert.toString() covers only the
   * function's own body, so a config whose convert delegates to a helper is
   * blind to changes in that helper.
   */
  it("is blind to a helper change until convertVersion is bumped", () => {
    let build = (data: any) => ({ id: data.id, name: data.name })
    const convert = (data: any) => build(data)

    const before = searchCollectionName({ ...base, convert })
    build = (data: any) => ({ id: data.id, name: data.name.toUpperCase() })
    expect(searchCollectionName({ ...base, convert })).toEqual(before)

    // ...which is what bumping convertVersion is for.
    expect(
      searchCollectionName({ ...base, convert, convertVersion: 2 })
    ).not.toEqual(before)
  })

  describe("convertVersion", () => {
    it("is omitted from the hash when unset, so existing collections keep their names", () => {
      expect(
        searchCollectionName({ ...base, convertVersion: undefined })
      ).toEqual(searchCollectionName(base))
    })

    it("yields a distinct name for every value", () => {
      const names = [undefined, 1, 2, "2", "rebuild-2026-08"].map(
        convertVersion => searchCollectionName({ ...base, convertVersion })
      )
      expect(names).toEqual(Array.from(new Set(names)))
    })
  })
})
