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
      fetch('https://bhrutledge.com/ma-legislature/dist/ma_house.geojson').then((response) => response.json()),
      fetch('https://bhrutledge.com/ma-legislature/dist/ma_senate.geojson').then((response) => response.json()),
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?output=csv')
        .then(( response ) => response.text())
        .then(( csv ) => {
          const parsed = Papa.parse( csv, { header: true, dynamicTyping: true });
          return Promise.resolve( parsed.data )
      }),
      /**
       * To add additional data about each rep/district, uncomment this `fetch`
       * and set the URL to a JSON data source with a `district` field.
       *
       * For a CSV, use https://www.papaparse.com/; see an example at:
       * https://github.com/actonmass/campaign-map/blob/main/index.html
       */
      // fetch('https://example.com/rep_data.json').then((response) => response.json()),
    ])
      .then(([houseFeatures, senateFeatures, thirdPartyParticipants, repData = []]) => {
        debugger;
        /* Build a rep info object, e.g. `rep.first_name`, `rep.extra_data` */
        const repDataByDistrict = repData.reduce((acc, cur) => {
          acc[cur.district] = cur;
          return acc;
        }, {});

        const repProperties = (feature) => {
          const data = repDataByDistrict[feature.properties.district] || {};
          return { ...feature.properties, ...data };
        };

        /* Templates for map elements */

        const districtLegend = () => /* html */`
          <div class="legend__item legend__item--Democrat">
            Democrat
          </div>
          <div class="legend__item legend__item--Republican">
            Republican
          </div>
          <div class="legend__item legend__item">
            Other
          </div>
        `;

        const districtStyle = (rep) => ({
          className: `district district--${rep.party}`,
        });

        const districtPopup = (rep) => `
          <p>
            <strong>${rep.first_name} ${rep.last_name}</strong>
            ${rep.party ? `<br />${rep.party}` : ''}
            <br />${rep.district}
            ${rep.url ? `<br /><a href="${rep.url}">Contact</a>` : ''}
          </p>
        `;

        const thirdPartyPopup = org => `
          <p>
            <strong>${org.Organization}</strong>
            <div>Sub Orgs</div>
            ${(org.subOrgs || []).map(org => {
              return `<div>
                <strong>${org.Name}</strong>
                <div>EDR Stance: ${org.EDR}</div>  
                <div>EDR Comments: ${org.EDRComment}</div>  
                <div>PFC Stance: ${org.PFC}</div>  
                <div>PFC Comments: ${org.PFCComment}</div>  
                <div>EV Stance: ${org.EV}</div>  
                <div>EV Comments: ${org.EVComment}</div>  
              </div>`
            })}
          </p>`;

        const onPopup = (e) => {
          const active = e.type === 'popupopen';
          e.target.getElement().classList.toggle('district--active', active);
        };

        /* Build the district layers */

        const districtLayer = (features) => L.geoJson(features, {
          style: (feature) => districtStyle(repProperties(feature)),
          onEachFeature: (feature, layer) => {
            const rep = repProperties(feature);

            layer.bindPopup(districtPopup(rep));
            layer.on('popupopen', onPopup);
            layer.on('popupclose', onPopup);

            // Enable searching by name or district; inspired by:
            // https://github.com/stefanocudini/leaflet-search/issues/52#issuecomment-266168224
            // eslint-disable-next-line no-param-reassign
            feature.properties.index = `${rep.first_name} ${rep.last_name} - ${rep.district}`;
          },
        });

        const thirdPartyLayer = thirdPartyParticipants => {
          // L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
          // var seen = [];
          // var subOrgMap = {};

          let orgs = {};

          thirdPartyParticipants.map(row => {
            if (orgs[row.Organization]) {
              orgs[row.Organization].subOrgs.push(row)
              return;
            }
            orgs[row.Organization] = {
              "type": "Feature",
              "properties": {
                "capacity" : "10", 
                "type" : "U-Rack",
                "mount" : "Surface",
                "index": row.Organization
              },
              "geometry": {
                "type": "Point",
                "coordinates": [ row.Longitude, row.Latitude ]
              },
              "subOrgs": [row],
            }
          });

          const test = {
            "type" : "FeatureCollection",
            "features" : [
              { 
              "type" : "Feature", 
              "properties" : {  
                "capacity" : "10", 
                "type" : "U-Rack",
                "mount" : "Surface",
                "index": "Common Cause"
              }, 
              "geometry" : { 
                "type" : "Point", 
                "coordinates" : [ -71.111, 42.332 ] 
              }
            },
              { 
                "type" : "Feature", 
                "properties" : {  
                  "capacity" : "10", 
                  "type" : "U-Rack",
                  "mount" : "Surface",
                  "index": "Search Me"
                }, 
                "geometry" : { 
                  "type" : "Point", 
                  "coordinates" : [ -71.121, 42.332 ] 
                }
            }]
          }
          const features = Object.keys(orgs).map(org => orgs[org])

          const features2 = {
            "type": "FeatureCollection",
            "features" : features
          }

          debugger;
          // return L.geoJSON( test );
          return L.geoJSON({"type": "FeatureCollection", 
            "features": features
          });
        }

        const districtSearch = (layer) => new L.Control.Search({
          layer,
          propertyName: 'index',
          initial: false,
          marker: false,
          textPlaceholder: 'Search legislators and districts',
          moveToLocation(latlng, title, map) {
            map.fitBounds(latlng.layer.getBounds());
            latlng.layer.openPopup();
          },
        });

    

        const layers = {
          House: districtLayer(houseFeatures),
          Senate: districtLayer(senateFeatures),
          Third: thirdPartyLayer(thirdPartyParticipants)
        };
        debugger;
        const searchControls = {
          House: districtSearch(layers.House),
          Senate: districtSearch(layers.Senate),
          Third: districtSearch(layers.Third)
        };

        /* Build the map */

        const map = L.map('map').addLayer(L.tileLayer.provider('CartoDB.Positron'));

        Object.keys(layers).forEach((chamber) => {
          layers[chamber]
            .on('add', () => searchControls[chamber].addTo(map))
            .on('remove', () => searchControls[chamber].remove());
        });

        map.addLayer(layers.House)
          .fitBounds(layers.House.getBounds())
          // Avoid accidental excessive zoom out
          .setMinZoom(map.getZoom());
        
        map.layerGroup

        map.addLayer(thirdPartyLayer(thirdPartyParticipants))
        // map.addLayer(L.layerGroup([L.marker([42.332, -71.111]).bindPopup(thirdPartyPopup())]))

        const layerControl = L.control.layers(layers, {}, {
          collapsed: false,
        });
        layerControl.addTo(map);

        const legendControl = L.control({ position: 'topright' });
        legendControl.onAdd = () => {
          const div = L.DomUtil.create('div', 'legend');
          div.innerHTML = districtLegend();
          return div;
        };
        legendControl.addTo(map);
      });
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