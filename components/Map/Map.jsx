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

// import markerBuildingBlue from '../../public/marker-building-blue.png'
// import markerSchoolBlue from '../../public/marker-school-blue.png'
import shad from '../../public/shad-64.png'
import schlBlu from '../../public/schl-64-blu.png'
import schlYel from '../../public/schl-64-yel.png'
import schlRed from '../../public/schl-64-red.png'
import bldgBlu from '../../public/bldg-64-blu.png'
import bldgYel from '../../public/bldg-64-yel.png'
import bldgRed from '../../public/bldg-64-red.png'


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
            //EV: "EV (Y/N)",
            //EVComment: "EV Comment",
            //PFC: "PFC (Y/N)",
            //PFCComment: "PFC Comment",
          };
          return `
							<span>
								<strong>${org.properties.index}</strong>
								<div>Sub Orgs</div>
								${(org.subOrgs || [])
              .map((org) => {
                return `<div>
										<strong>${org.Name}</strong>
										<div>EDR Stance: ${org[columns.EDR]}</div>
										<div>EDR Comments: ${org[columns.EDRComment]}</div>
									</div>
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
            iconSize:     [28, 28],
            shadowSize:   [28, 28],
            iconAnchor:   [16, 30],
            shadowAnchor: [16, 30],
            popupAnchor:  [0, 0]
          }
        })

        // make a variable for each of the icon flavors
        var markerSchlBlu = new thirdPartyIcon( {iconUrl: schlBlu});
        var markerSchlYel = new thirdPartyIcon( {iconUrl: schlYel});
        var markerSchlRed = new thirdPartyIcon( {iconUrl: schlRed});
        var markerBldgBlu = new thirdPartyIcon( {iconUrl: bldgBlu});
        var markerBldgYel = new thirdPartyIcon( {iconUrl: bldgYel});
        var markerBldgRed = new thirdPartyIcon( {iconUrl: bldgRed});

        // put these into a constant to namespace and give them rise on hover
        const thirdPartyPoints = ( feature, latlng ) => {
          var geoJsonMarkers = {
            markerSchlAye: { icon: markerSchlBlu, riseOnHover: true },
            markerSchlMix: { icon: markerSchlYel, riseOnHover: true },
            markerSchlNay: { icon: markerSchlRed, riseOnHover: true },
            markerBldgAye: { icon: markerBldgBlu, riseOnHover: true },
            markerBldgMix: { icon: markerBldgYel, riseOnHover: true },
            markerBldgNay: { icon: markerBldgRed, riseOnHover: true }
          }

          // get all of the stances for any child of this icon
          var myKeys = Object.keys( feature.subOrgs );
          var myValues = myKeys.map( (key) => feature.subOrgs[key]["EDR (Y/N)"] );

          // use a reduce to see if its all ayes, all nays, or a mixed bag
          const countOccurances = ( arr, check ) => arr.reduce(( a, c ) => ( c === check ? a + 1 : a ), 0 );
          const countAyes = countOccurances( myValues, "In Favor Of" );
          const countNays = countOccurances( myValues, "Against")

          // check what color this variable should be
          var color = "yel";
          if ( myKeys.length === countAyes ) {
            color = "blu";
          } else if ( myKeys.length === countNays ) {
            color = "red";
          }

        
          // TODO: this is definitely very ugly, nesting ifs in a switch statement
          //   to be revised maybe in the future. I couldn't think of a more 
          //   clever way to achieve this in the moment
          switch( feature.properties.type ) {
            case "Student Group":
            case "Professor":
              if (color === "blu") {
                return L.marker( latlng, geoJsonMarkers.markerSchlAye );
              } else if (color === "red" ) {
                return L.marker( latlng, geoJsonMarkers.markerSchlNay );
              } else {
                return L.marker( latlng, geoJsonMarkers.markerSchlMix );
              }
            case "For-Profit Organization":
            case "Non-Profit Organization":
              if (color === "blu") {
                return L.marker( latlng, geoJsonMarkers.markerBldgAye );
              } else if (color === "red") {
                return L.marker( latlng, geoJsonMarkers.markerBldgNay );
              } else {
                return L.marker( latlng, geoJsonMarkers.markerBldgMix );
              }
              
            default:
              return L.marker( latlng );
            }
        }

        
  


        /* Build the district layers */

        const districtLayer = (features) =>
          L.geoJson(features, {
            style: (feature) => districtStyle(repProperties(feature)),
            //TODO: edit thirdPartyPoints to do what we want it to
            pointToLayer: thirdPartyPoints,
            onEachFeature: (feature, layer) => {
              if (feature.properties.category === "thirdParty") {
                layer.on("click", function () {
                  sidebar.setContent(`<div>${thirdPartyPopup(feature)}</div>`);
                  sidebar.toggle();
                });
                layer.on("popupopen", onPopup);
                layer.on("popupclose", onPopup);
              } else {
                const rep = repProperties(feature);

                layer.bindPopup(districtPopup(rep));
                layer.on("popupopen", onPopup);
                layer.on("popupclose", onPopup);

                // Enable searching by name or district; inspired by:
                // https://github.com/stefanocudini/leaflet-search/issues/52#issuecomment-266168224
                // eslint-disable-next-line no-param-reassign
                feature.properties.index = `${rep.first_name} ${rep.last_name} - ${rep.district}`;
              }

            },
          });



        // so we have access to some things here
        //   we are mapping everything into the 'suborgs' object of 
        //
        // what needs to happen, for every 'organization', if its the first time you've seen it
        
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
                // TODO: kinda janky with the 'toString()' call, also make sure 'Category' is consistent with
                //   the google sheets backend
                type: [row.Category].toString()
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

        const districtSearch = (layer) =>
          new L.Control.Search({
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
          });

        const layers = {
          House: districtLayer(houseFeatures),
          Senate: districtLayer(senateFeatures)
        };

        // add the GeoJSON features from the thirdParty data to both the House and Senate variables
        const thirdPartyLayer2 = thirdPartyGeoJSON(thirdPartyParticipants);
        layers.House.addData(thirdPartyLayer2);
        layers.Senate.addData(thirdPartyLayer2);

        const searchControls = {
          House: districtSearch(layers.House),
          Senate: districtSearch(layers.Senate)
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

        var marker = L.marker([51.2, 7])
          .addTo(map)
          .on("click", function () {
            sidebar.toggle();
          });

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
        <div id="sidebar"></div>
        <div id="map-wrapper">
          <div id="map"></div>
        </div>
      </Fragment>
    );
  }
}

export default Map;
