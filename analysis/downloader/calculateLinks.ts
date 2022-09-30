import { writeFileSync } from "fs"
import { groupBy, maxBy } from "lodash"
import { loadMatchedActions } from "./loader"

type Results = {
  largestGroup: string
  deepestGroup: string
  groups: {
    depth: number
    chain: string[]
    size: number
    /** Bill ID of the bill that all other histories merged into */
    headId: string
    /** Bill ID's of descendants of the bill */
    descendantIds: string[]
  }[]
}

type Node = { depth: number; id: string; children: Node[]; parent?: Node }

/**
 * Joins bill histories based on mutual references. The output is a forest of bill histories, we're interested in the longest chains.
 *
 */
export async function calculateLinks(path: string, out: string) {
  const actions = await loadMatchedActions(path)

  const billGraph: Map<string, Node> = new Map()
  const getOrCreate = (id: string) => {
    if (!billGraph.has(id)) billGraph.set(id, { id, depth: -1, children: [] })
    return billGraph.get(id)!
  }

  const byBill = groupBy(actions, a => a.id)
  Object.entries(byBill).forEach(([id, actions]) => {
    const node = getOrCreate(id)
    node.children = actions
      .flatMap((a: any): any => {
        switch (a.type) {
          case "accompaniedBy":
            return a.context.billIds ?? []
          case "newDraft":
            return a.context.billIds ?? []
          default:
            return []
        }
      })
      .map(id => {
        const child = getOrCreate(id)
        child.parent = node
        return child
      })
  })

  const groups: Results["groups"] = []

  Array.from(billGraph.values())
    .filter(n => !n.parent)
    .forEach(head => {
      const descendants = getDescendants(head)
      const deepest = maxBy(descendants, d => d.depth)

      groups.push({
        size: 1 + descendants.length,
        depth: deepest?.depth ?? 1,
        chain: deepest ? getChain(deepest).map(d => d.id) : [],
        headId: head.id,
        descendantIds: descendants.map(d => d.id)
      })
    })

  groups.sort((a, b) => {
    const d = b.depth - a.depth
    return d === 0 ? b.size - a.size : d
  })

  const results: Results = {
    largestGroup: maxBy(groups, g => g.size)!.headId,
    deepestGroup: maxBy(groups, g => g.depth)!.headId,
    groups: groups
  }

  writeFileSync(out, JSON.stringify(results, null, 2))
}

function getDescendants(node: Node): Node[] {
  const descendants: Node[] = []
  const toVisit: Node[] = []
  let next: Node | undefined = node
  node.depth = 0
  while (next) {
    next?.children.forEach(n => {
      if (n.depth === -1) {
        toVisit.push(n)
        descendants.push(n)
        n.depth = next!.depth + 1
      }
    })
    next = toVisit.pop()
  }
  return descendants
}

function getChain(start: Node): Node[] {
  let node: Node | undefined = start
  const chain = [node]
  while ((node = node.parent)) chain.push(node)
  return chain.reverse()
}
