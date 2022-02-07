// structure based on API response from: 
// https://malegislature.gov/api/swagger/index.html?url=/api/swagger/v1/swagger.json#/Documents/Documents_GetDocumentsAll

const bills = [
  {
    "title": "An Act fostering voter opportunities, trust, equity and security",
    "billNumber": "H.4359",
    "generalCourtNumber": 192,
    "documentText": "Text of an amendment, recommended by the committee on Ways and Means, to the Senate Bill fostering voter opportunities, trust, equity and security (Senate, No. 2554). January 26, 2022.",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
  {
    "title": "An Act relative to the digital right to repair",
    "billNumber": "S.2622",
    "generalCourtNumber": 192,
    "documentText": "string",
    "primarySponsor": {
      "id": "string",
      "name": "Claire D. Cronin",
    }
  },
  {
    "title": "An Act relative to immediate COVID-19 recovery needs",
    "billNumber": "H.4219",
    "generalCourtNumber": 192,
    "documentText": "Emergency Preamble - Whereas, The deferred operation of this act would tend to defeat its purposes, which are to direct the expenditure of certain federal funds and to make certain changes in law, each of which is immediately necessary to carry out those appropriations or to accomplish other important public purposes, therefore it is hereby declared to be an emergency law, necessary for the immediate preservation of the public convenience.",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
  {
    "title": "An Act fostering voter opportunities, trust, equity and security",
    "billNumber": "H.4000",
    "generalCourtNumber": 192,
    "documentText": "An Act making appropriations for the fiscal year 2022 for the maintenance of the departments, boards, commissions, institutions and certain activities of the Commonwealth, for interest, sinking fund and serial bond requirements and for certain permanent improvements",
    "primarySponsor": {
      "id": "string",
      "name": "House Committee on Ways and Means",
    }
  },
]

const testimonies = [
  {
    submitter: "John Doe",
    dateSubmitted: "2/3/2022",
    billNumber: "H.4359",
    support: "Endorse",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    submitter: "Jane Doe",
    dateSubmitted: "1/3/2022",
    billNumber: "H.4359",
    support: "Oppose",
    text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. "
  },
  {
    submitter: "Jim Doe",
    dateSubmitted: "2/3/2022",
    billNumber: "H.4359",
    support: "Neutral",
    text: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. "
  }
]

export { bills, testimonies }