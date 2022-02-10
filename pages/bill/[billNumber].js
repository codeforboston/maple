import { documents } from "../../components/MockAPIResponseDocuments"

export const getStaticPaths = async () => {

  // in future, hit an endpoint - malegislature.gov is slow  (response 27 seconds vs 4 seconds as an imported object)
  // const res = await fetch('https://malegislature.gov/api/Documents')
  // const data = await res.json()

  // bills are documents that have a bill number
  const bills = documents.filter(document => document.BillNumber != null) 

  const paths = bills.map(bill => {  
    const billNumber = (bill.BillNumber === null) ? bill.DocketNumber : bill.BillNumber
    return { params: { billNumber: billNumber } }
  }) 
 
  return {
    paths: paths,
    fallback: false
  }
}

export const getStaticProps = async (context) => {
  const billNumber = context.params.billNumber

  const res = await fetch(`https://malegislature.gov/api/Documents/${billNumber}/DocumentHistoryActions`)
  const data = await res.json()

  return {
    props: { bill: data }
  }
}

const BillPage = ({bill}) => {
  return ( 
    <div>
      <h1>hello from {bill.BillNumber}</h1>
    </div>
  )
}

export default BillPage