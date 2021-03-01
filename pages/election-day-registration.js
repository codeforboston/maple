import { Layout } from "../components";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});

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
        <MapWithNoSSR />
        <br />
        Overview: (5 sentence summary)
        <br />
      </p>
    </Layout>
  );
}

export default ElectionDayRegistration;
