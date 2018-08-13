import axios from "axios";
import { $ } from "../modules/bling";
const mapOptions = {
  center: { lat: 38, lng: -122.5 },
  zoom: 10
};
function loadPlaces(map, lat = 38, lng = -122.5) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const resturants = res.data;
    if (!resturants.length) {
      return;
    }

    //Create a bounds ,that way you do not need to adjust the zoom level for each search
    const bounds = new google.maps.LatLngBounds();

    //Infor window on markers
    const infoWindow = new google.maps.InfoWindow();

    const markers = resturants.map(resturant => {
      const [resturantLng, resturantLat] = resturant.location.coordinates;
      const position = { lat: resturantLat, lng: resturantLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });
      marker.resturant = resturant;
      return marker;
    });
    //When user click on a marker , show details of that resturant in infowindow
    markers.forEach(marker =>
      marker.addListener("click", function() {
        const html = `<div class="popup">
        <a href="/stores/${this.resturant.slug}">
        <img src="/uploads/${this.resturant.photo || "store.png"}"
        alt="${this.resturant.name}"/>
        <p> ${this.resturant.name}- ${this.resturant.location.address}</p>
        </a></div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this); //this refers to current marker
      })
    );
    //Zoom the map to fit all the markers perfectly
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) {
    return;
  }
  //make google map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  const autoComplete = new google.maps.places.Autocomplete(input);
  //load the map dynamically once user type location
  autoComplete.addListener("place_changed", () => {
    const place = autoComplete.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;
