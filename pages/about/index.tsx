export async function getStaticProps() {
  return {
    redirect: {
      destination: '/about/mission-and-goals',
      fallback: true
    },
  }
}

export default function Page() {
}