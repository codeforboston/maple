import { GetServerSideProps } from "next"

/** /chat starts a new conversation. */
export default function ChatIndex() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/chat/new", permanent: false }
})
