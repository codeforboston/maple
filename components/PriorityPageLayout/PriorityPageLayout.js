import { Component } from "react"
import { LayoutWrapper } from ".."
import styles from "./PriorityPageLayout.module.css"
import dynamic from "next/dynamic"

const currentLegislativeSession = "192"

const MapWithNoSSR = dynamic(() => import("../Map/Map.jsx"), {
  ssr: false
})

class PriorityLayout extends Component {
  constructor() {
    super()
    this.state = {
      currentBills: []
    }
  }

  componentDidMount() {
    fetch(this.props.legislator_data)
      .then(response => response.text())
      .then(csv => {
        // separate entries from the first row of the csv
        const headers = csv.split("\n")[0].split(",")

        // find bills in current session using format: session/bill#
        this.setState({
          currentBills: headers.filter(
            h => h.substring(0, 4) === currentLegislativeSession + "/"
          )
        })
      })
  }

  render() {
    return (
      <LayoutWrapper pageTitle={this.props.pageTitle}>
        <div className={styles.container}>
          <aside className={styles.sidebar}>
            <b>Disclaimer</b>
            <p className={styles.disclaimer}>
              The legislative information we aggregated and display on the map
              does not - and cannot - fully reflect the views and actions of
              state legislators. For more, read our{" "}
              <a href="/disclaimer">full disclaimer</a>.
            </p>
            <b>Further Reading</b>
            {this.props.further_reading}
          </aside>

          <article className={styles.map}>
            {this.props.children}
            <MapWithNoSSR
              legislator_data={this.props.legislator_data}
              third_party_data={this.props.third_party_data}
            />
          </article>

          <aside className={styles.sidebar}>
            <b>Add your voice</b>
            <p>
              If you are a professor, student group, or business, you can add
              your position to our map using{" "}
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSfhfGLP9Tjy9P49vyv-yk706pOISFH0ED8uImrlaqRRDBS8hg/viewform">
                this form
              </a>
            </p>
            <b>Currently introduced bills</b>
            <ul>
              {this.state.currentBills.map((bill, i) => (
                <li key={i}>
                  <a href={"https://malegislature.gov/Bills/" + bill}>
                    {bill.split("/")[1]}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </LayoutWrapper>
    )
  }
}

export default PriorityLayout
