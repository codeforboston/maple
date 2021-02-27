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
        We are one of 22 states without Election Day Registration, which allows
        voters to register on the day of the election. We currently allow voters
        to register until 20 days before the election. This is a Jim Crowe era
        law, which continues to have harmful effects today. Democracies should
        promote participation, and make it easier to vote, not maintain
        arbitrary hoops. Read our full letter here.
        <br />
        <a href="/edr-letter">Election Day Registration</a>
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
