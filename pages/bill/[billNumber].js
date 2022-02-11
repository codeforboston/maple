import { documents } from "../../components/MockAPIResponseDocuments"
import { Button, Row } from 'react-bootstrap'
import SearchBar from '../../components/SearchBar/SearchBar'
import BillTestimonies from '../../components/BillTestimonies/BillTestimonies'
import AddTestimony from '../../components/AddTestimony/AddTestimony'

export const getStaticPaths = async () => {

  // in future, hit an endpoint - malegislature.gov is slow  (response 27 seconds vs 4 seconds as an imported object)
  // const res = await fetch('https://malegislature.gov/api/Documents')
  // const data = await res.json()

  // bills are documents that have a bill number
  const bills = documents.filter(document => document.BillNumber != null) 

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

const BillPage = ({bill}) => {
  return (
    <>
      <SearchBar/>
      <Row>
        <div className="text-center">
          <Button className="m-1">Name</Button>
          <Button className="m-1">History</Button>
          <Button className="m-1">Cosponsors</Button>
          <Button className="m-1">Status</Button>
        </div>
      </Row>
      <div className="text-center">
        <h4>{bill ? bill.BillNumber + "  General Court: "+ bill.GeneralCourtNumber : ""} </h4>
      </div>
      <div>
        <p>
          {bill ? bill.DocumentText : ""}
        </p>
      </div>
      <BillTestimonies
        bill={bill}
      /> 
      <AddTestimony/>

    </>
  );
}

export default BillPage