import { Col, Container, Row } from "../bootstrap"
import styles from "./Profile.module.css"

export const ActivityLevel = ({ uid }: { uid: string | undefined }) => {
  return (
    <Container className={`${styles.activityLevel} text-white`}>
      <Row>
        <div className={`${styles.activityLevelTitle}`}> Activiy Level</div>
      </Row>
      {uid ? (
        <Row>
          <Col className=""></Col>
        </Row>
      ) : (
        <Row>Log in to see your activity history</Row>
      )}
    </Container>
  )
}
