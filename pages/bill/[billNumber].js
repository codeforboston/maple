import { bills } from "../../components/MockAPIResponseBills"

export const getStaticPaths = async () => {

  // in future, hit a different endpoint - this is too slow  (response 27 seconds vs 4 seconds as an imported object)
  // const res = await fetch('https://malegislature.gov/api/Documents')
  // const data = await res.json()
  // and below
  // const paths = data.map(bill => {
  
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