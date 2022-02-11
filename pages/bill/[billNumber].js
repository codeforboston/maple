import { documents } from "../../components/MockAPIResponseDocuments"
import { createPage } from "../../components/page"
import { Button, Row } from 'react-bootstrap'
import SearchBar from '../../components/SearchBar/SearchBar'
import Bill from '../../components/Bill/Bill'
import BillTestimonies from '../../components/BillTestimonies/BillTestimonies'
import AddTestimony from '../../components/AddTestimony/AddTestimony'

export const getStaticPaths = async () => {

  // in future, hit an endpoint - malegislature.gov is slow  (response 27 seconds vs 4 seconds as an imported object)
  // const res = await fetch('https://malegislature.gov/api/Documents')
  // const data = await res.json()

  const bills = documents.filter(document => document.BillNumber != null) // documents with bill numbers are bills

  const paths = bills.map(bill => {  
    const billNumber = bill.BillNumber
    return { params: { billNumber: billNumber } }
  }) 
 
  return {
    paths: paths,
    fallback: false
  }
}

export const getStaticProps = async (context) => {
  const billNumber = context.params.billNumber

  const res = await fetch(`https://malegislature.gov/api/Documents/${billNumber}`)
  const data = await res.json()

  return {
    props: { bill: data }
  }
}

export default createPage({
  v2: true,
  title: "Bill",
  Page: ({bill}) => {
    return (
      <Bill
        bill={bill}
      />
    )
  }
})
