import { Layout } from "..";
import styles from "./PriorityPageLayout.module.css";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../Map/Map.jsx"), {
    ssr: false,
});
  
function PriorityLayout(props) {
    // props should be data sources and content
    // that then get converted into map overlay and list of bills

    // flex main column with SideBar

    const currentBills = []; //["HR555"];

    return(
        <Layout pageTitle={props.pageTitle}>

            <div className={styles.container}>

                <article className={styles.map}>
                    {props.children}
                    <MapWithNoSSR
                        legislator_data={props.legislator_data}
                        third_party_data={props.third_party_data}
                    />
                </article>
                <aside className={styles.sidebar}>
                    <b>Add your voice</b>
                    <p>If you are a professor, student group, or business, add your position to our map with <a href="https://docs.google.com/forms/d/e/1FAIpQLSfhfGLP9Tjy9P49vyv-yk706pOISFH0ED8uImrlaqRRDBS8hg/viewform">this form</a></p>
                    <b>Currently introduced bills</b>
                    <ul>
                        {currentBills.map(bill => <li>{bill}</li>)}
                    </ul>
                </aside>
            </div>
        </Layout>
    );
}

export default PriorityLayout;