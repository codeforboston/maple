import { Layout } from "../components";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});
/* URL via EDR Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const EDR_LEGISLATOR_DATA_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRe608XwzuZhMlOP6GKU5ny1Kz-rlGFUhwZmhZwAZGbbAWOHlP01-S3MFD9dlerPEqjynsUbeQmBl-E/pub?gid=0&single=true&output=csv";
/* URL via Third Party Data > File > Publish to the web > Link > EDR > CSV > Publish */
const EDR_THIRD_PARTY_DATA_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?output=csv";

function ElectionDayRegistration() {
  return (
    <Layout pageTitle="Election Day Registration">
      <p>
        <b>Why should we have Election Day Registration?</b>
        <br />
        Currently, MA voters must register twenty days before an election in order to
        participate. Removing this barrier, and allowing eligible voters to register
        up to, and on, election day would allow more Massachusetts voters to make their
        voices heard – a critical aspect of a healthy democracy. Currently, twenty-two
        states allow EDR in some form. In those states, voter
        <a href="https://www.yalelawjournal.org/forum/election-day-registration-and-the-limits-of-litigation"> turnout has increased
        considerably</a>. Demos, a non-partisan public policy organization <a href="https://www.demos.org/research/what-same-day-registration-where-it-available"> found in a 2009
        survey </a> that implementing EDR created “minimal” costs, as legislators merely
        reallocated existing resources, and actually reduced the need for provisional
        ballots – saving the time and expense of processing those ballots. Voters
        registering on election day would still be required to provide proof of identity
        and proof of residence, making the process of registration no different from that
        of the current process.You can read our full letter on this issue, <a href="/edr-letter">here</a>.
        <br />
        <b>Advocacy Map</b>
        <MapWithNoSSR legislator_data={EDR_LEGISLATOR_DATA_LINK} third_party_data={EDR_THIRD_PARTY_DATA_LINK}/>
        <br />
        Overview: (5 sentence summary)
        <br />
      </p>
    </Layout>
  );
}

export default ElectionDayRegistration;
