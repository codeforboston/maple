import { Image } from "react-bootstrap"
import styles from "./Leaf.module.css"

const Leaf = ({ direction }) => {
  return (
    <div className={styles.container}>
      <Image
        className={direction === "left" ? styles.left : styles.right}
        fluid
        src="leaf-asset.png"
        alt="leaf"
      />
    </div>
  )
}

export default Leaf
