/* jshint esversion: 6 */

window.onload = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope:', registration.scope);
    }).catch(function(error) {
      console.log('ServiceWorker registration failed:', error);
    });
  }
};

document.querySelectorAll('.mdc-tab').forEach(item => {
  item.addEventListener('click', event => {
    //handle click
    switch (item.id) {
      case 'mapButton':
        document.getElementById('mapTab').style.display = "block";
        document.getElementById('settingsTab').style.display = "none";
        document.getElementById('savedTab').style.display = "none";
        console.log("map button pressed");
        break;
      case 'settingsButton':
        document.getElementById('mapTab').style.display = "none";
        document.getElementById('settingsTab').style.display = "block";
        document.getElementById('savedTab').style.display = "none";
        console.log("location button pressed");
        break;
      case 'savedButton':
        document.getElementById('mapTab').style.display = "none";
        document.getElementById('settingsTab').style.display = "none";
        document.getElementById('savedTab').style.display = "block";
        console.log("saved button pressed");
        break;
      default:
        console.log("something else pressed");
        break;
    }
  });
});

const tabBar = document.querySelector('.mdc-tab-bar').MDCTabBar;
window.mdc.autoInit();

const endPoint = "https://api.openchargemap.io/v3/poi/?key=90b0a208-e066-4755-83fa-c6f75fd9c7ad&output=json&maxresults=50&compact=true&verbose=false&latitude=41.983430&longitude=-87.787240&distance=50";
var map;

// Attach your callback function to the `window` object
function initMap() {
  // JS API is loaded and available
  // The location of Home
  let home = {
    lat: 42.092363,
    lng: -87.978326
  };

  let somewhereElse = {
    lat: 42.281627,
    lng: -88.003748
  };
  // The map, centered at Home
  map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 13,
      center: somewhereElse
    });
  // The marker, positioned at Home
  let marker = new google.maps.Marker({
    position: home,
    map: map
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      // infoWindow.open(map);
      map.setCenter(pos);
    });
  } else {
    // Browser doesn't support Geolocation
    console.log("didn't give location permission");
  }
}

fetch(endPoint).then((res) => {
  return res.json();
}).then((json) => {
  console.log(json);

  json.forEach(element => {

    let title = element.AddressInfo.Title;
    //console.log(title);
    //if (title.includes("Supercharger")) {
    //console.log(element);
    let location = {
      lat: element.AddressInfo.Latitude,
      lng: element.AddressInfo.Longitude
    };

    let marker = new google.maps.Marker({
      position: location,
      map: map
    });
    //}
  });
});
