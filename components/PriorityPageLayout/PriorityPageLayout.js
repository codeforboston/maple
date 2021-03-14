import { Component } from "react";
import { LayoutWrapper } from "..";
import styles from "./PriorityPageLayout.module.css";
import dynamic from "next/dynamic";

const currentLegislativeSession = "192";

const MapWithNoSSR = dynamic(() => import("../Map/Map.jsx"), {
    ssr: false,
});
  
class PriorityLayout extends Component {

    constructor() {
        super();
        this.state = {
            currentBills: []
        }
    }

    componentDidMount() {
        fetch(this.props.legislator_data)
        .then(response => response.text())
        .then(csv => {
            // separate entries from the first row of the csv 
            const headers = csv.split('\n')[0].split(',');

            // find bills in current session using format: session/bill#
            this.setState({
                currentBills: headers.filter(h => h.substring(0,4) === currentLegislativeSession + "/")
            })
        })
    }

    render() {
        return(
            <LayoutWrapper pageTitle={this.props.pageTitle}>
                <div className={styles.container}>

                    <article className={styles.map}>
                        {this.props.children}
                        <MapWithNoSSR
                            legislator_data={this.props.legislator_data}
                            third_party_data={this.props.third_party_data}
                        />
                    </article>
                    
                    <aside className={styles.sidebar}>
                        <b>Add your voice</b>
                        <p>If you are a professor, student group, or business, you can add your position to our map using <a href="https://docs.google.com/forms/d/e/1FAIpQLSfhfGLP9Tjy9P49vyv-yk706pOISFH0ED8uImrlaqRRDBS8hg/viewform">this form</a></p>
                        <b>Currently introduced bills</b>
                        <ul>
                            {this.state.currentBills.map(bill => <li>{bill}</li>)}
                        </ul>
                    </aside>

                </div>
            </LayoutWrapper>
        );
    }
}

export default PriorityLayout;