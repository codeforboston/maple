import { Component, Fragment } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-providers";
import "leaflet-search";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Papa from "papaparse";

/**
 * Based on https://github.com/bhrutledge/ma-legislature/blob/main/index.html
 */
class Map extends Component {
  componentDidMount() {
    /* Load the legislative district boundaries and rep data */

    Promise.all([
      /* The GeoJSON contains basic contact information for each rep */
      fetch(
        "https://bhrutledge.com/ma-legislature/dist/ma_house.geojson"
      ).then((response) => response.json()),
      fetch(
        "https://bhrutledge.com/ma-legislature/dist/ma_senate.geojson"
      ).then((response) => response.json()),
      /* URL via EDR Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
      fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRe608XwzuZhMlOP6GKU5ny1Kz-rlGFUhwZmhZwAZGbbAWOHlP01-S3MFD9dlerPEqjynsUbeQmBl-E/pub?gid=0&single=true&output=csv"
      )
        .then((response) => response.text())
        .then((csv) => {
          const parsed = Papa.parse(csv, { header: true, dynamicTyping: true });
          return Promise.resolve(parsed.data);
        }),
      /* URL via Third Party Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
      fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?output=csv"
      )
        .then((response) => response.text())
        .then((csv) => {
          const parsed = Papa.parse(csv, { header: true, dynamicTyping: true });
          return Promise.resolve(parsed.data);
        }),
    ]).then(
      ([
        houseFeatures,
        senateFeatures,
        repData = [],
        thirdPartyParticipants = [],
      ]) => {
        /* Build a rep info object, e.g. `rep.first_name`, `rep.extra_data` */

        const repDataByURL = repData.reduce((acc, cur) => {
          acc[cur.url] = cur;
          return acc;
        }, {});

        console.log(repDataByURL);

        const repProperties = (feature) => {
          const data = repDataByURL[feature.properties.url] || {};
          return { ...feature.properties, ...data };
        };

        /* Templates for map elements */
        const districtLegend = () => /* html */ `
          <strong>Grade of support for bill</strong>
          <div class="legend__item legend__item--grade-1">
            1: Committed to vote
          </div>
          <div class="legend__item legend__item--grade-2">
            2: Substantial past advocacy
          </div>
          <div class="legend__item legend__item--grade-3">
            3: Some past advocacy
          </div>
          <div class="legend__item legend__item--grade-4">
            4: No support
          </div>
        `;

        const districtStyle = (rep) => ({
          className: `district district--${rep.party} district--grade-${rep.grade}`,
        });

        const districtPopup = (rep) => /* html */ `
          <p>
            <strong>${rep.first_name} ${rep.last_name}</strong>
            ${rep.party ? `<br />${rep.party}` : ""}
            <br />${rep.district}
            ${rep.url ? `<br /><a href="${rep.url}">Contact</a>` : ""}
          </p>
          <p>
            <!-- TODO: Show textual description of grade? -->
            Grade: ${rep.grade}
            <!-- TODO: Display individual bills, but keep it generic.
            This probably means using a regex to match keys like "191/H685".
            -->
          </p>
        `;

        const thirdPartyPopup = (org) => {
          const columns = {
            EDR: "EDR (Y/N)",
            EDRComment: "EDR Comment",
            EV: "EV (Y/N)",
            EVComment: "EV Comment",
            PFC: "PFC (Y/N)",
            PFCComment: "PFC Comment",
          };
          return `
							<p>
								<strong>${org.properties.index}</strong>
								<div>Sub Orgs</div>
								${(org.subOrgs || [])
                  .map((org) => {
                    return `<div>
										<strong>${org.Name}</strong>
										<div>EDR Stance: ${org[columns.EDR]}</div>
										<div>EDR Comments: ${org[columns.EDRComment]}</div>
										<div>PFC Stance: ${org[columns.PFC]}</div>
										<div>PFC Comments: ${org[columns.PFCComment]}</div>
										<div>EV Stance: ${org[columns.EV]}</div>
										<div>EV Comments: ${org[columns.EVComment]}</div>
									</div>
								  <br />`;
                  })
                  .join("")}
							</p>`;
        };

        const onPopup = (e) => {
          const active = e.type === "popupopen";
          e.target.getElement().classList.toggle("district--active", active);
        };

        /* Build the district layers */

        const districtLayer = (features) =>
          L.geoJson(features, {
            style: (feature) => districtStyle(repProperties(feature)),
            onEachFeature: (feature, layer) => {
              const rep = repProperties(feature);

              layer.bindPopup(districtPopup(rep));
              layer.on("popupopen", onPopup);
              layer.on("popupclose", onPopup);

              // Enable searching by name or district; inspired by:
              // https://github.com/stefanocudini/leaflet-search/issues/52#issuecomment-266168224
              // eslint-disable-next-line no-param-reassign
              feature.properties.index = `${rep.first_name} ${rep.last_name} - ${rep.district}`;
            },
          });

        const thirdPartyLayer = (thirdPartyParticipants) => {
          let orgs = {};

          thirdPartyParticipants.map((row) => {
            if (orgs[row.Organization]) {
              orgs[row.Organization].subOrgs.push(row);
              return;
            }
            orgs[row.Organization] = {
              type: "Feature",
              properties: {
                capacity: "10",
                type: "U-Rack",
                mount: "Surface",
                index: row.Organization,
              },
              geometry: {
                type: "Point",
                coordinates: [row.Longitude, row.Latitude],
              },
              subOrgs: [row],
            };
          });

          const features = Object.keys(orgs).map((org) => orgs[org]);

          return L.geoJSON(
            {
              type: "FeatureCollection",
              features: features,
            },
            {
              onEachFeature: (feature, layer) => {
                layer.bindPopup(thirdPartyPopup(feature));
                layer.on("popupopen", onPopup);
                layer.on("popupclose", onPopup);
              },
            }
          );
        };

        const districtSearch = (layer) =>
          new L.Control.Search({
            layer,
            propertyName: "index",
            initial: false,
            marker: false,
            textPlaceholder: "Search legislators and districts",
            moveToLocation(latlng, title, map) {
              // try catch to get bounds to zoom to in both cases
              try {
                map.fitBounds(latlng.layer.getBounds());
              } catch (err) {
                var dist = 0.005;
                map.fitBounds([
                  [latlng.lat - dist, latlng.lng - dist],
                  [latlng.lat + dist, latlng.lng + dist],
                ]);
              }
              latlng.layer.openPopup();
            },
          });

        const layers = {
          House: districtLayer(houseFeatures),
          Senate: districtLayer(senateFeatures),
          Third: thirdPartyLayer(thirdPartyParticipants),
        };

        const searchControls = {
          House: districtSearch(layers.House),
          Senate: districtSearch(layers.Senate),
          Third: districtSearch(layers.Third),
        };

        /* Build the map */
        const map = L.map("map").addLayer(
          L.tileLayer.provider("CartoDB.Positron")
        );

        Object.keys(layers).forEach((chamber) => {
          layers[chamber]
            .on("add", () => searchControls[chamber].addTo(map))
            .on("remove", () => searchControls[chamber].remove());
        });

        map
          .addLayer(layers.House)
          .fitBounds(layers.House.getBounds())
          // Avoid accidental excessive zoom out
          .setMinZoom(map.getZoom());

        map.addLayer(thirdPartyLayer(thirdPartyParticipants));

        const layerControl = L.control.layers(
          layers,
          {},
          {
            collapsed: false,
          }
        );
        layerControl.addTo(map);

        const legendControl = L.control({ position: "bottomleft" });
        legendControl.onAdd = () => {
          const div = L.DomUtil.create("div", "legend");
          div.innerHTML = districtLegend();
          return div;
        };
        legendControl.addTo(map);
      }
    );
  }

  render() {
    return (
      <Fragment>
        <div id="map-wrapper">
          <div id="map"></div>
        </div>
      </Fragment>
    );
  }
}

export default Map;
