import { Image } from "react-bootstrap"
import styles from "./Leaf.module.css"

const Leaf = () => {
  return (
    <div className={styles.container}>
      <Image
        className={styles.hearings}
        fluid
        src="leaf-asset.png"
        alt="leaf"
      />
    </div>
  )
}

export default Leaf
