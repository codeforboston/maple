import { Layout } from "../components";

function AdvocacyMap() {
  return (
    <Layout pageTitle="Democracy Maps">
    <p>
      <b>Democracy Maps</b>
      <br />
      <br />
      This platform is a product of a partnership with the Boston Chapter of Code for America. 
      We hope this digital public space can facilitate more meaningful public discussion of important democracy issues.
      We also hope this type of digital public space is utilized for other issues, and in other states. 
      Our source code is publicly available on our <a href="https://github.com/codeforboston/advocacy-maps">Github</a>. 
      We created three maps, one for each <a href="/about">priority</a>, and overlaid our senate and 
      representative districts over each map. We then graded our legislators' previous votes and co-sponsorships relevant 
      to our priorities, and color-coded the districts accordingly. While this information is not perfectly indicative 
      of our legislator's views and actions (read our disclaimer here)(link the disclaimer), it is the entirety of 
      what is publicly available. We firmly believe that improving public access to such information, 
      and embracing innovation as a means to do so, is critical for a healthy democracy in the digital age – 
      which is why that is the subject of <a href="/transparency-ma">our main 2021 initiative</a>. 
      <br />
      <br />
      Organizations (for-profit and non-profit), student groups, professors, non-profits) can “plant their flag” on our maps,
      geotag their location, and make a statement on each priority. Please complete this form to endorse or object 
      to each GGP priority, and to make a statement on one or more of our issues (suggested length, 2-4 sentences). 
      Currently, the voices of thought-leaders and constituent groups are drowned out of the political process 
      by the influence of corporations and wealthy donors, and undervalued by profit-driven algorithms on media platforms.
      We hope this space can be leveraged so that the voices of constituents and stakeholders can be better heard. 
    </p>
    </Layout>
  );
}

export default AdvocacyMap;
