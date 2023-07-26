import { Image } from "react-bootstrap"
import styles from "./Leaf.module.css"

const Leaf = ({ position }) => {
  return (
    <div className={styles.container}>
      <Image className={styles[position]} fluid src="/leaf.svg" alt="leaf" />
    </div>
  )
}

export default Leaf
