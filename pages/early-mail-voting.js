import { Layout } from "../components";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});
/* URL via EMV Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const EMV_LEGISLATOR_DATA_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiMO006znF3HZe1PW_eC9KyBTTHVvkDXu5FIiErLUbyeY-qtxN8AiKGGGq3eY5ka15PNwhR7iffLxD/pub?gid=0&single=true&output=csv";
const EMV_THIRD_PARTY_DATA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?gid=791972090&single=true&output=csv";

function EarlyMailVoting() {
  return (
    <Layout pageTitle="Early/Mail Voting – Constitutional Amendment">
      <p>
        <b>
          Why do we need Early/ Mail Voting?
        </b>
        <br />
        You can read our full letter on this issue, <a href="/early-mail-voting-letter">here</a>.
        <br />
        <b>Advocacy Map</b>
        <MapWithNoSSR legislator_data={EMV_LEGISLATOR_DATA_LINK} third_party_data={EMV_THIRD_PARTY_DATA}/>
      </p>
    </Layout>
  );
}

export default EarlyMailVoting;
