import { Component } from "react";
// import { LayoutWrapper } from "..";
import NewLayout from "../NewLayout/NewLayout";
import styles from "./NewLayoutPriorityPage.module.css";
import dynamic from "next/dynamic";
import schlGra from "../../public/schl-64-gra.png";
import bldgGra from "../../public/bldg-64-gra.png";
import nprfGra from "../../public/nprf-64-gra.png";
import nprfBlu from "../../public/nprf-64-blu.png";
import nprfYel from "../../public/nprf-64-yel.png";
import nprfRed from "../../public/nprf-64-red.png";
import eofcGra from "../../public/eofc-64-gra.png";

const currentLegislativeSession = "192";
const ICON_DEFAULT_STYLE = { width: "30px", height: "30px" };

const MapWithNoSSR = dynamic(() => import("../Map/Map.jsx"), {
  ssr: false,
});

class NewPriorityLayout extends Component {
  constructor() {
    super();
    this.state = {
      currentBills: [],
    };
  }

  componentDidMount() {
    fetch(this.props.legislator_data)
      .then((response) => response.text())
      .then((csv) => {
        // separate entries from the first row of the csv
        const headers = csv.split("\n")[0].split(",");

        // find bills in current session using format: session/bill#
        this.setState({
          currentBills: headers.filter(
            (h) => h.substring(0, 4) === currentLegislativeSession + "/"
          ),
        });
      });
  }

  render() {
    return (
      <NewLayout pageTitle={this.props.pageTitle}>
        <div className={styles.container}>
          <section className={styles.letterContainer}>
            <span className={styles.disclaimerTitle}>
              {this.props.disclaimerText}
            </span>
            <a
              href={this.props.letterLink}
              className={styles.priorityCardHeaderButton}
            >
              <i className="fa fa-map-marker"></i>
              &nbsp; Read Our Full Letter
            </a>
          </section>
          <section className={styles.sidebar}>
            <div className={styles.legendContatiner}>
              <div className={styles.colorKey}>
                {/* <div class="legend__item legend__item--grade-1">
                  Committed to vote
                </div> */}
                <div class="legend__item legend__item--grade-2">
                  Substantial past advocacy
                </div>
                <div class="legend__item legend__item--grade-3">
                  Some past advocacy
                </div>
                <div class="legend__item legend__item--grade-4">No support</div>
              </div>
            </div>
            <div className={styles.iconContainer}>
              <div className={styles.iconsLegend}>
                <div className={styles.iconAndTitle}>
                  <img src={schlGra} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Schools</span>
                </div>
                <div className={styles.iconAndTitle}>
                  <img src={nprfGra} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Non-profit</span>
                </div>
                <div className={styles.iconAndTitle}>
                  <img src={bldgGra} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>For profit</span>
                </div>
                <div className={styles.iconAndTitle}>
                  <img src={eofcGra} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Public Official</span>
                </div>
              </div>
              <div className={styles.iconColorLegend}>
                <div className={styles.iconAndTitle}>
                  <img src={nprfBlu} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Endorses</span>
                </div>
                <div className={styles.iconAndTitle}>
                  <img src={nprfYel} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Mixed</span>
                </div>
                <div className={styles.iconAndTitle}>
                  <img src={nprfRed} alt="test" style={ICON_DEFAULT_STYLE} />
                  <span>Opposes</span>
                </div>
              </div>
            </div>
            <div className={styles.disclaimerContainer}>
              <b>Map Disclaimer</b>
              <p className={styles.disclaimer}>
                The legislative information we aggregated and display on the map
                does not - and cannot - fully reflect the views and actions of
                state legislators. For more, read our{" "}
                <a class="link" href="/disclaimer">
                  full disclaimer
                </a>
                .
              </p>
            </div>
          </section>

          <section className={styles.map}>
            <MapWithNoSSR
              legislator_data={this.props.legislator_data}
              third_party_data={this.props.third_party_data}
            />
          </section>

          <section className={styles.sidebar}>
            <div>
              <b>Further Reading</b>
              {this.props.further_reading}
            </div>
            <div className={styles.sidebarSection}>
              <b>Currently introduced bills</b>
              <ul>
                {this.state.currentBills.map((bill) => (
                  <li>
                    <a
                      className={styles.link}
                      href={"https://malegislature.gov/Bills/" + bill}
                    >
                      {bill.split("/")[1]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </NewLayout>
    );
  }
}

export default NewPriorityLayout;
