import { Layout } from "../components";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});
/* URL via PFC Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const PFC_LEGISLATOR_DATA_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTz02R3xU_Ebt0zqadcs6NSJWzUgufX61i7hUFstj6xnG1k2qR_o1CE56a6NGwcVTXzTVazqQtCCYEl/pub?gid=0&single=true&output=csv";
/* URL via Third Party Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const PFC_THIRD_PARTY_DATA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?gid=58233927&single=true&output=csv";

function CampaignFinance() {
  return (
    <Layout pageTitle="Campaign Finance – Constitutional Amendment">
      <p>
        <b>
          Why do we need to amend the Consitution for campaign finance
          regulation?
        </b>
        <br />
        In 1998, the voters of Massachusetts
        <a href="https://ballotpedia.org/Massachusetts_Campaign_Finance_Reform_Initiative,_Question_2_(1998)"> overwhelmingly </a>
        approved a ballot measure to allow candidates who agreed to spending and donation limits access to public funds. But in 2003, the legislature
        <a href="https://www.nytimes.com/2003/06/21/us/massachusetts-legislature-repeals-clean-elections-law.html"> repealed the fair elections law </a>
        as a last-minute amendment to the state budget. Public funding provisions exist in the Commonwealth for candidates for statewide office,
        but candidates for state legislature seats have no such support. The data on publicly financed elections is
        <a href="https://www.demos.org/sites/default/files/publications/FreshStart_PublicFinancingCT_0.pdf"> clear</a>.
        When Connecticut implemented publicly financed elections, legislators were able to spend less time fundraising and spend more time
        with constituents. More citizens became donors and educated themselves about policy issues. The influence of lobbyists declined, and more
        bipartisan, publicly supported bills were passed. The people of Massachusetts deserve responsive representation in the state legislature,
        and adopting public financing would help achieve that goal.
        <br />
        You can read our full letter on this issue, <a href="/campaign-finance-letter">here</a>.
        <br />
        <b>Advocacy Map</b>
        <MapWithNoSSR legislator_data={PFC_LEGISLATOR_DATA_LINK} third_party_data={PFC_THIRD_PARTY_DATA}/>
      </p>
    </Layout>
  );
}

export default CampaignFinance;
