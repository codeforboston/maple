import { Card } from "react-bootstrap";

export const PriorityBillsCard = (bill:{id:string, title:string, description:string, color:string, backgroundColor:string, width:string,height:string, borderRadius:string, approval:string} ) => {
  const style = {
    color: bill.color,
    backgroundColor: bill.backgroundColor,
    width: bill.width,
    height: bill.height,
    borderRadius: bill.borderRadius,
  }
    return (<Card style={style}>
    <Card.Body>
      <Card.Title>{bill.title} {bill.approval}</Card.Title>
      <Card.Text>
        {bill.description}
      </Card.Text>
    </Card.Body>
  </Card>)
}

