import { Component, Fragment } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-providers";
import "leaflet-search";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Papa from "papaparse";
import "./L.Control.Sidebar";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";


import shad from "../../public/shad-64.png";
import schlBlu from "../../public/schl-64-blu.png";
import schlYel from "../../public/schl-64-yel.png";
import schlRed from "../../public/schl-64-red.png";
import schlGra from "../../public/schl-64-gra.png";
import bldgBlu from "../../public/bldg-64-blu.png";
import bldgYel from "../../public/bldg-64-yel.png";
import bldgRed from "../../public/bldg-64-red.png";
import bldgGra from "../../public/bldg-64-gra.png";
import nprfBlu from "../../public/nprf-64-blu.png";
import nprfYel from "../../public/nprf-64-yel.png";
import nprfRed from "../../public/nprf-64-red.png";
import nprfGra from "../../public/nprf-64-gra.png";


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
      fetch(
        this.props.legislator_data
      )
        .then((response) => response.text())
        .then((csv) => {
          const parsed = Papa.parse(csv, { header: true, dynamicTyping: true });
          return Promise.resolve(parsed.data);
        }),
      fetch(
        this.props.third_party_data
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

        const districtStyle = (rep) => ({
          className: `district district--${rep.party} district--grade-${rep.grade}`,
        });

        const grades = {
          1: "committed to vote",
          2: "substantial past advocacy",
          3: "some past advocacy",
          4: "no support",
        };

        const districtPopup = (rep) => /* html */ `
          <p>
            <strong>${rep.first_name} ${rep.last_name}</strong>
            ${rep.party ? `<br />${rep.party}` : ""}
            <br />${rep.district}
            ${rep.url ? `<br /><a href="${rep.url}">Contact</a>` : ""}
          </p>
          <p>
            <!-- TODO: Show textual description of grade? -->
						<strong>${rep.first_name} ${rep.last_name}</strong> has
						<strong>${grades[rep.grade]}</strong> for this issue.
            <br />
						Co-Sponsored:
						${Object.keys(rep)
            .map((key) => {
              if (key.includes("/") && rep[key] === "C") {
                return `<br /><a href='https://malegislature.gov/Bills/${key}'>${key}</a>`;
              }
            })
            .join("")}
						<br />
						Voted:
						${Object.keys(rep)
            .map((key) => {
              if (
                key.includes("/") &&
                (rep[key] === "Y" || rep[key] === "N")
              ) {
                return `<br /><strong>${rep[key] === "Y" ? "Yes" : "No"
                  }</strong> on <a href='https://malegislature.gov/Bills/${key}'>${key}</a>`;
              }
            })
            .join("")}

            <!-- TODO: Display individual bills, but keep it generic.
            This probably means using a regex to match keys like "191/H685".
            -->
          </p>
        `;

        const thirdPartyPopup = (org) => {
          const columns = {
            category: "Category",
            position: "Position",
            comment: "Comment",
          };
          // Make a dictionary to store the suborg data by category
          var subOrgsByCategory = {};
          for (let subOrg in org.subOrgs) {
            subOrg = org.subOrgs[subOrg];
            if (subOrg[columns.category] in subOrgsByCategory) {
              subOrgsByCategory[subOrg[columns.category]].push(subOrg);
            } else {
              subOrgsByCategory[subOrg[columns.category]] = [subOrg];
            }
          }
          return `
							<span>
								<center><h3><strong>${org.properties.index}</strong></h3></center>
								${(Object.keys(subOrgsByCategory))
              .map((category) => {
                return `<h4><strong><u>${category}s</u></strong></h4>

                    ${subOrgsByCategory[category].map((subOrg) => {
                  const color = subOrg[columns.position] == "Endorse" ? "green" : "red";
                  const checkOrX = "Endorse" ? "&#9745;" : "&#9746;";
                  return `<div>
                      	<strong>${subOrg.Name}</strong>
                      	<div><p style="color:${color};">${subOrg[columns.position]} ${checkOrX} </p></div>
                      	<blockquote><i>"${subOrg[columns.comment]}"</i></blockquote>
                      </div>
                      <br />`;

                }).join("")
                  }
                    <br />`;
              })
              .join("")}
							</span>`;
        };

        // TODO: target.getElement() is trying something weird
        const onPopup = (e) => {
          const active = e.type === "popupopen";
          // e.target.getElement().classList.toggle("district--active", active);
        };

        // === THIRD PARTY ICONS ===
        // =========================

        // class for third party icons
        var thirdPartyIcon = L.Icon.extend({
          options: {
            shadowUrl: shad,
            iconSize: [28, 28],
            shadowSize: [28, 28],
            iconAnchor: [16, 30],
            shadowAnchor: [16, 30],
            popupAnchor: [0, 0],
          },
        });

        // make a variable for each of the icon flavors
        var markerSchlBlu = new thirdPartyIcon({ iconUrl: schlBlu });
        var markerSchlYel = new thirdPartyIcon({ iconUrl: schlYel });
        var markerSchlRed = new thirdPartyIcon({ iconUrl: schlRed });
        var markerBldgBlu = new thirdPartyIcon({ iconUrl: bldgBlu });
        var markerBldgYel = new thirdPartyIcon({ iconUrl: bldgYel });
        var markerBldgRed = new thirdPartyIcon({ iconUrl: bldgRed });
        var markerNprfBlu = new thirdPartyIcon({ iconUrl: nprfBlu });
        var markerNprfYel = new thirdPartyIcon({ iconUrl: nprfYel });
        var markerNprfRed = new thirdPartyIcon({ iconUrl: nprfRed });


        // put these into a constant to namespace and give them rise on hover
        const thirdPartyPoints = (feature, latlng) => {
          var geoJsonMarkers = {
            markerSchlAye: { icon: markerSchlBlu, riseOnHover: true },
            markerSchlMix: { icon: markerSchlYel, riseOnHover: true },
            markerSchlNay: { icon: markerSchlRed, riseOnHover: true },
            markerBldgAye: { icon: markerBldgBlu, riseOnHover: true },
            markerBldgMix: { icon: markerBldgYel, riseOnHover: true },
            markerBldgNay: { icon: markerBldgRed, riseOnHover: true },
            markerNprfAye: { icon: markerNprfBlu, riseOnHover: true },
            markerNprfMix: { icon: markerNprfYel, riseOnHover: true },
            markerNprfNay: { icon: markerNprfRed, riseOnHover: true },
          };

          // get all of the stances for any child of this icon
          var myKeys = Object.keys(feature.subOrgs);
          var myValues = myKeys.map((key) => feature.subOrgs[key]["Position"]);

          // use a reduce to see if its all ayes, all nays, or a mixed bag
          const countOccurances = (arr, check) =>
            arr.reduce((a, c) => (c === check ? a + 1 : a), 0);
          const countAyes = countOccurances(myValues, "Endorse");
          const countNays = countOccurances(myValues, "Oppose");

          // check what color this variable should be
          var color = "yel";
          if (myKeys.length === countAyes) {
            color = "blu";
          } else if (myKeys.length === countNays) {
            color = "red";
          }

          // TODO: this is definitely very ugly, nesting ifs in a switch statement
          //   to be revised maybe in the future. I couldn't think of a more
          //   clever way to achieve this in the moment
          switch (feature.properties.type) {

            case "Student Group":
            case "Professor":
              if (color === "blu") {
                return L.marker(latlng, geoJsonMarkers.markerSchlAye);
              } else if (color === "red") {
                return L.marker(latlng, geoJsonMarkers.markerSchlNay);
              } else {
                return L.marker(latlng, geoJsonMarkers.markerSchlMix);
              }

            case "For-Profit Organization":
              if (color === "blu") {
                return L.marker(latlng, geoJsonMarkers.markerBldgAye);
              } else if (color === "red") {
                return L.marker(latlng, geoJsonMarkers.markerBldgNay);
              } else {
                return L.marker(latlng, geoJsonMarkers.markerBldgMix);
              }

            case "Non-Profit Organization":
              if (color === "blu") {
                return L.marker(latlng, geoJsonMarkers.markerNprfAye);
              } else if (color === "red") {
                return L.marker(latlng, geoJsonMarkers.markerNprfNay);
              } else {
                return L.marker(latlng, geoJsonMarkers.markerNprfMix);
              }

            default:
              return L.marker(latlng);
          }
        };


        /* Build the district layers */
        const districtLayer = (features) => {

          return (L.geoJson(features, {
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
          })
          )
        };

        /* given third party features, create a MarkerClusterGroup */
        const thirdPartyIconCluster = (features) => {

          // setup clustering, initialize seen cluster 
          var iconClusters = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
              return L.divIcon({ 
                html: '<b>' + cluster.getChildCount() + '</b>',
                className:'thirdPartyCluster',
                iconSize: L.point(36, 36)
              });
            }
          });

          // var iconClusters = L.markerClusterGroup();

          // loop over the features to add all the icons and popup logic
          //   add the layers to the clusterGroup along the way
          L.geoJson(features, {
            style: (feature) => districtStyle(repProperties(feature)),
            pointToLayer: thirdPartyPoints,
            onEachFeature: (feature, layer) => {
              layer.on("click", function () {
                sidebar.setContent(`<div>${thirdPartyPopup(feature)}</div>`);
                sidebar.toggle();
              });
              layer.on("popupopen", onPopup);
              layer.on("popupclose", onPopup);

              // add this layer with popup and icon to the cluster
              iconClusters.addLayer(layer);

            },
          })

          // return just the clusters
          return iconClusters
        }


        /* Turn data from google sheet into a geoJSON layer*/
        const thirdPartyGeoJSON = (thirdPartyParticipants) => {
          let orgs = {};

          thirdPartyParticipants.map((row) => {
            if (orgs[row.Organization]) {
              orgs[row.Organization].subOrgs.push(row);
              return;
            }
            orgs[row.Organization] = {
              type: "Feature",
              properties: {
                index: row.Organization,
                category: "thirdParty",
                // TODO: toString() call is maybe a little janky
                type: [row.Category].toString(),
              },
              geometry: {
                type: "Point",
                coordinates: [row.Longitude, row.Latitude],
              },
              subOrgs: [row],
            };
          });

          const features = Object.keys(orgs).map((org) => orgs[org]);
          return features;
        };



        const districtSearch = (layer) => {

          return (new L.Control.Search({
            layer,
            propertyName: "index",
            initial: false,
            marker: false,
            textPlaceholder: "Search legislators and districts",
            moveToLocation(latlng, title, map) {
              // try catch statement to get bounds to zoom to in both cases
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
          }))
        }


        // get the third party cluster layer to add to both house and senate feature group
        const thirdPartyClusteredIcons = thirdPartyIconCluster(thirdPartyGeoJSON(thirdPartyParticipants));

        // Now when defining layers, just wrap both the house AND the clustering icons in a feature group
        //   searchable, and everything renders as expected
        const layers = {
          House: new L.FeatureGroup([districtLayer(houseFeatures), thirdPartyClusteredIcons]),
          Senate: new L.FeatureGroup([districtLayer(senateFeatures), thirdPartyClusteredIcons]),
        };

        const searchControls = {
          House: districtSearch(layers.House),
          Senate: districtSearch(layers.Senate),
        };

        /* Build the map */
        const map = L.map("map").addLayer(
          L.tileLayer.provider("CartoDB.Positron")
        );

        var sidebar = L.control.sidebar("sidebar", {
          closeButton: true,
          position: "left",
        });
        map.addControl(sidebar);

        map.on("click", function () {
          sidebar.hide();
        });

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


        const layerControl = L.control.layers(
          layers,
          {},
          {
            collapsed: false,
          }
        );
        layerControl.addTo(map);

      }
    );
  }

  /* Render now returns the map fragment, and the legend below it */
  render() {

    return (
      <Fragment>
        <div id="sidebar"></div>
        <div id="map-wrapper">
          <div id="map"></div>
        </div>

        {/* Div to put the legend directly below the map instead of on the it */}
        <div className="map__legend">
          <h5>Legend</h5>
          <div className="map__legend map__legend-info">
            <div className="map__legend-item--grade">
              <strong>Grade of support for bill</strong>
              <div class="legend__item legend__item--grade-1">
                Committed to vote</div>
              <div class="legend__item legend__item--grade-2">
                Substantial past advocacy</div>
              <div class="legend__item legend__item--grade-3">
                Some past advocacy</div>
              <div class="legend__item legend__item--grade-4">
                No support</div>
            </div>
            <div className="map__legend-item--icons">
              <strong>Icons</strong>
              <div class="legend__item legend__item--null">
                <img src={schlGra} alt="test" style={{ width: "20px", height: "20px" }}></img>
                &nbsp; Schools</div>
              <div class="legend__item legend__item--null">
                <img src={nprfGra} alt="test" style={{ width: "20px", height: "20px" }}></img>
                &nbsp; Non-profit</div>
              <div class="legend__item legend__item--null">
                <img src={bldgGra} alt="test" style={{ width: "20px", height: "20px" }}></img>
                &nbsp; For profit</div>
            </div>
            <div className="map__legend-item--colors">
              <strong>Third Party Support</strong>
              <div class="legend__item legend__item--in-fave">
                Endorses</div>
              <div class="legend__item legend__item--mixed">
                Mixed</div>
              <div class="legend__item legend__item--against">
                Opposes</div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Map;
