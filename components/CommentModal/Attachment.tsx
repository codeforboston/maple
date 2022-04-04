import { useEffect } from "react"
import { Button } from "../bootstrap"
import { UseEditTestimony } from "../db"

// TODO: pass in useEditTestimony, add upload callback to hook.
// Views to update:
// - edit modal in profile view
// - add/edit modal in bill detail view
// - testimony rows on testimony table, bill detail, and private profile
// - testimony modal on home page, bill detail, testimony table, private profile, and public profile

export function Attachment(edit: UseEditTestimony) {
  return <Button className="mt-2">Upload a document</Button>
}
