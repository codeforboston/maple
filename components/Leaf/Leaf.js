import { Image } from "react-bootstrap"
import styles from "./Leaf.module.css"

const Leaf = ({ position }) => {
  console.log(position)
  return (
    <div className={styles.container}>
      <Image
        className={styles[position]}
        fluid
        src="leaf-asset.png"
        alt="leaf"
      />
    </div>
  )
}

export default Leaf
