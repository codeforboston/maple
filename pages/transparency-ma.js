import { Layout } from "../components";

function TransparencyInMA() {
  return (
    <Layout pageTitle="Transparency in MA">
      <div className="transparency-project">
        <b>The Project:</b>
        <p Style="text-indent:1cm"></p>
      </div>
      <div className="issue-solution-box">
        <div className="transparency-issue">
          <b>The Issue:</b>
          <p Style="text-indent:1cm"></p>
          <p Style="text-indent:1cm"></p>
        </div>
        <div className="transparency-solution">
          <b>The Solution:</b>
          <p Style="text-indent:1cm"></p>
          <p Style="text-indent:1cm"></p>
          <p Style="text-indent:1cm"></p>
        </div>
      </div>
      <div className="transparency-background">
        <b>Background:</b>
        <p Style="text-indent:1cm"></p>
        <p Style="text-indent:1cm"></p>
      </div>
    </Layout>
  );
}

export default TransparencyInMA;
