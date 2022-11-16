import React from "react"
import { Card } from "../Card/Card"

interface CardObject {
    id: number
    Name: string
    sponsorType: string 
  }

  export const BillSponsors = (props: { 
    PrimarySponsor: CardObject[]
    CoSponsors: CardObject[]

})=> {

    props.CoSponsors.unshift(props.PrimarySponsor[0]);

    const rows = [...Array( Math.ceil(props.CoSponsors.length/ 3) )].map(e => Array(3));

    const productRows = rows.map( (row, idx)  => props.CoSponsors.slice(idx * 3, idx * 3+ 3));

    return <Card header="Sponsors" cardObjects={productRows} numOfSponsors={props.CoSponsors.length}/>
          
    }
        
