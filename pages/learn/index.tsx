export async function getStaticProps() {
  return {
    redirect: {
      destination: "/learn/basics-of-testimony",
      fallback: true
    }
  }
}

export default function Page() {}
