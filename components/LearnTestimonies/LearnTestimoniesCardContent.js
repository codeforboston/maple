import { Row, Col} from '../bootstrap';
import Image from "react-bootstrap/Image";
import styles from './LearnTestimoniesCard.module.css';
import Container from 'react-bootstrap/Container';

const LearnTestimoniesCardContent = ({children, src, alt, index}) =>{
    return (
        <Container fluid>
            <Row className={`mb-3 ${styles.content}`}>
                <Col className='align-self-center' xs={{order:index%2==0?1:4}}>
                    <div className={styles.vector-4}>
                    <Image fluid src={src} alt={alt}/>
                    </div>
                </Col>
                <Col className='text-center align-self-center' xs={{order:2}}>
                    <p className={`${styles.text} ${styles.cardBodyParagraph}`}>
                        {children.P1}
                    </p>
                </Col>
            </Row>
        </Container>
    )
}

export default LearnTestimoniesCardContent;