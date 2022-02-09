import { bills } from "../../components/MockAPIResponse"

export const getStaticPaths = async () => {

  // for future, when API endpoint set up
  // const res = await fetch('https://malegislature.gov/api/Documents')
  // const data = await res.json()

  const paths = bills.map(bill => {
    const billNumForURL = bill.billNumber.replace('.', '')
    return {
      params: { billNumber: billNumForURL }
    }
  }) 
  
  console.log(paths)

  return {
    paths: paths,
    fallback: false
  }
}

export const getStaticProps = async (context) => {
  const billNumber = context.params.billNumber

  //for when endpoint is set up - pull data on a bill

  const res = await fetch('https://apiURL/' + billNumber)
  const data = await res.json()

  return {
    props: { bill: data }
  }
}

const BillPage = ({bill}) => {
  return ( 
    <div>
      <h1>hello from {bill.billNumber}</h1>
    </div>
  )
}

export default BillPage