// structure based on API response from: 
// https://malegislature.gov/api/swagger/index.html?url=/api/swagger/v1/swagger.json#/Documents/Documents_GetDocumentsAll

const bills = [
  {
    "title": "An Act fostering voter opportunities, trust, equity and security",
    "billNumber": "H.4359",
    "documentText": "Text of an amendment, recommended by the committee on Ways and Means, to the Senate Bill fostering voter opportunities, trust, equity and security (Senate, No. 2554). January 26, 2022.",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
  {
    "title": "An Act relative to the digital right to repair",
    "billNumber": "S.2622",
    "documentText": "string",
    "primarySponsor": {
      "id": "string",
      "name": "Claire D. Cronin",
    }
  },
  {
    "title": "An Act relative to immediate COVID-19 recovery needs",
    "billNumber": "H.4219",
    "documentText": "Emergency Preamble - Whereas, The deferred operation of this act would tend to defeat its purposes, which are to direct the expenditure of certain federal funds and to make certain changes in law, each of which is immediately necessary to carry out those appropriations or to accomplish other important public purposes, therefore it is hereby declared to be an emergency law, necessary for the immediate preservation of the public convenience.",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
  {
    "title": "An Act fostering voter opportunities, trust, equity and security",
    "billNumber": "H.4000",
    "documentText": "An Act making appropriations for the fiscal year 2022 for the maintenance of the departments, boards, commissions, institutions and certain activities of the Commonwealth, for interest, sinking fund and serial bond requirements and for certain permanent improvements",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
]

export { bills }