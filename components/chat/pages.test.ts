/** @jest-environment node */
import { getServerSideProps } from "../../pages/chat/index"

test("/chat starts a new conversation", async () => {
  expect(await getServerSideProps({} as any)).toEqual({
    redirect: { destination: "/chat/new", permanent: false }
  })
})
