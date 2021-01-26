import { Component, Fragment } from "react";
import Head from "next/head";
import L from "leaflet";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const districtStyle = (rep) => ({
  className: `district district--${rep.commitments ? "committed" : "join"}`,
});

const callToAction = (rep) => `
  <a class="map-link"
    href="https://actonmass.org/the-campaign/?your_state_representative=${
      rep.first_name
    } ${rep.last_name}#join-your-district-team"
    target="_parent"
  >
    <strong>Join ${rep.commitments ? "the Campaign" : "District Team"}</strong>
  </a>
`;

const repCommitments = (rep) =>
  rep.commitments
    ? `
		<p>
      <table>
        <tr>
          <th colspan="2">
            <strong>Committed to vote for:</strong>
          </th>
        </tr>
        <tr>
          <td class="commitment">${rep.committee_votes ? "✓" : ""}</td>
          <td>Committee votes made public</td>
        </tr>
        <tr>
          <td class="commitment">${rep.public_bills ? "✓" : ""}</td>
          <td>Bills made public for 72 hours</td>
        </tr>
        <tr>
          <td class="commitment">${rep.roll_call ? "✓" : ""}</td>
          <td>Lower threshold for public roll call</td>
        </tr>
      </table>
    </p>
  `
    : "";

const districtPopup = (rep) => `
	<p>
		<strong>${rep.first_name} ${rep.last_name}</strong>
		${rep.url ? `(<a href="${rep.url}">contact</a>)` : ""}
		<br />${rep.party ? `${rep.party},` : ""}
		${rep.district}
		${rep.elect ? "(Elect)" : ""}
	</p>
	${repCommitments(rep)}
	${callToAction(rep)}
`;

const onPopup = (e) => {
  const active = e.type === "popupopen";
  e.target.getElement().classList.toggle("district--active", active);
};

const districtLegend = () => `
		<div class="legend__item legend__item--committed">Committed to Vote</div>
    <div class="legend__item legend__item--join">Join District Team</div>
`;

const style = {
  width: "100%",
  height: "50vh",
};

class Map extends Component {
  componentDidMount() {
    Promise.all([
      fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4l7bRcBIgwsEPGM_s9zF9csIeTgE2No_4tA6MuDCBUbfmWY_e9mAfzPpCJTsIK_hUzOyJ8CmdGMsX/pub?gid=641305740&single=true&output=csv"
      )
        .then((response) => response.text())
        .then((csv) => {
          const parsed = Papa.parse(csv, { header: true, dynamicTyping: true });
          return Promise.resolve(parsed.data);
        }),
      fetch(
        "https://raw.githubusercontent.com/bhrutledge/ma-legislature/main/dist/ma_house.geojson"
      ).then((response) => response.json()),
      fetch(
        "https://raw.githubusercontent.com/bhrutledge/ma-legislature/main/dist/ma_senate.geojson"
      ).then((response) => response.json()),
    ]).then(([supporters, houseFeatures, senateFeatures]) => {
      const supportersByDistrict = supporters.reduce((acc, cur) => {
        acc[cur.district] = cur;
        return acc;
      }, {});

      function repProperties(feature) {
        const supporter = supportersByDistrict[feature.properties.district];
        return supporter;
      }

      const houseLayer = L.geoJson(houseFeatures, {
        style: (feature) => districtStyle(repProperties(feature)),
        onEachFeature: (feature, layer) => {
          const rep = repProperties(feature);
          layer.bindPopup(districtPopup(rep));
          layer.on("popupopen", onPopup);
          layer.on("popupclose", onPopup);
          feature.properties.index = `${rep.first_name} ${rep.last_name} - ${rep.district}`;
        },
      });

      const searchControl = new L.Control.Search({
        layer: houseLayer,
        propertyName: "index",
        initial: false,
        marker: false,
        textPlaceholder: "Search reps and districts",
        moveToLocation(latlng, title, map) {
          map.fitBounds(latlng.layer.getBounds());
          latlng.layer.openPopup();
        },
      });

      const legendControl = L.control({ position: "topright" });
      legendControl.onAdd = () => {
        const div = L.DomUtil.create("div", "legend");
        div.innerHTML = districtLegend();
        return div;
      };
      const baseLayer = L.tileLayer(
        "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        }
      );

      this.map = L.map("map")
        .addLayer(baseLayer)
        .addLayer(houseLayer)
        .addControl(searchControl)
        .addControl(legendControl)
        .fitBounds(houseLayer.getBounds());

      // Avoid accidental excessive zoom out
      this.map.setMinZoom(this.map.getZoom());
    });
  }

  render() {
    return (
      <Fragment>
        <Head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet-search@2.9.9/dist/leaflet-search.min.css"
          />
        </Head>
        <div id="map" style={style}></div>
        <Head>
          <script src="https://unpkg.com/leaflet-search@2.9.9/dist/leaflet-search.min.js"></script>
        </Head>
      </Fragment>
    );
  }
}

export default Map;
