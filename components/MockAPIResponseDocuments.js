// https://malegislature.gov/api/swagger/index.html?url=/api/swagger/v1/swagger.json#/Documents/Documents_GetDocumentsAll

const documents = [
  {
    BillNumber: "H1524",
    DocketNumber: "HD3897",
    Title: "An Act relative to child custody orders",
    PrimarySponsor: {
      Id: "LDC1",
      Name: "Linda Dean Campbell",
      Type: 1,
      Details:
        "http://malegislature.gov/api/GeneralCourts/192/LegislativeMembers/LDC1"
    },
    GeneralCourtNumber: 192,
    Details: "http://malegislature.gov/api/GeneralCourts/192/Documents/H1524",
    IsDocketBookOnly: false
  }
]

export { documents }
