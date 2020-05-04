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
const switchControl = document.querySelector('.mdc-switch').MDCSwitch;

window.mdc.autoInit();


let center = {};
var map;
var db = new Dexie("savedTempDatabase");
db.version(1).stores({
  saved: 'temp'
});

// Attach your callback function to the `window` object
function initMap() {
  // JS API is loaded and available
  // The location of Home
  // let home = {
  //   lat: 42.092363,
  //   lng: -87.978326
  // };

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
  // let marker = new google.maps.Marker({
  //   position: home,
  //   map: map
  // });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      // infoWindow.open(map);
      console.log(center);
      populateMap();
      map.setCenter(center);
    });
  } else {
    // Browser doesn't support Geolocation
    console.log("didn't give location permission");
  }
}

let elements = [];

let clickedTitle = '';
let clickedAddress1 = '';
let clickedAddress2 = '';
let clickedLat = '';
let clickedLong = '';

let savedLocations = [];

function populateMap() {
  let jsonData = "";

  console.log(center);
  let lat = center.lat;
  let long = center.lng;
  //console.log("lat: " + lat + "long: " + long);
  const endPoint = "https://api.openchargemap.io/v3/poi/?key=90b0a208-e066-4755-83fa-c6f75fd9c7ad&output=json&maxresults=500&compact=true&verbose=false&latitude=" +
    lat + "&longitude=" +
    long + "&distance=50";

  fetch(endPoint).then((res) => {
    return res.json();
  }).then((json) => {
    //console.log(json);

    let infowindow = new google.maps.InfoWindow();

    json.forEach(element => {
      //console.log(element);

      //console.log(title);
      let title = element.AddressInfo.Title;
      let address1 = element.AddressInfo.AddressLine1;
      let town = element.AddressInfo.Town;
      let state = element.AddressInfo.StateOrProvince;
      let postCode = element.AddressInfo.Postcode;

      let contentString = '<div id="content">' +
        '<h3 id="chargerTitle">' + title + '</h3>' +
        '<p id="address">' + address1 + '</p>' +
        '<p id="address2">' + town + ", " + state + " " + postCode + '</p>' +
        '<button class="mdc-button mdc-button--raised saveButton">  <span class="mdc-button__ripple saveButton"></span> Save Location</button>' +
        '</div>';

      let location = {
        lat: element.AddressInfo.Latitude,
        lng: element.AddressInfo.Longitude
      };

      //if (title.includes("Supercharger")) {
      let marker = new google.maps.Marker({
        position: location,
        map: map
      });

      marker.addListener('click', () => {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
        console.log("lat: " + marker.getPosition().lat());
        clickedLat = marker.getPosition().lat();
        console.log("lat: " + marker.getPosition().lng());
        clickedLong = marker.getPosition().lng();
      });
      //}
    });

    google.maps.event.addListener(infowindow, 'domready', function() {
      // whatever you want to do once the DOM is ready
      console.log("clicked infowindow: " + document.querySelector('#chargerTitle').textContent);
      clickedTitle = document.querySelector('#chargerTitle').textContent;
      clickedAddress1 = document.querySelector('#address').textContent;
      clickedAddress2 = document.querySelector('#address2').textContent;
    });
  });
  //console.log(elements);
}

//pressing save button
document.addEventListener('click', (event) => {
  //console.log("klick");
  let element = event.target;
  //console.log(element);
  if (element.classList.contains("saveButton")) {
    console.log("Pressed save button");
    console.log(clickedLat);
    console.log(clickedLong);
    console.log(clickedTitle);

    let clickedLocation = {
      title: clickedTitle,
      lat: clickedLat,
      lng: clickedLong,
      address1: clickedAddress1,
      address2: clickedAddress2
    };

    savedLocations.push(clickedLocation);
    populateSavedList();
  }
});

function populateSavedList() {
  document.querySelector('#savedTab').innerHTML = '';

  savedLocations.forEach(element => {
    let currentTemp = '';
    let endPoint = "https://api.openweathermap.org/data/2.5/weather?lat=" + element.lat + "&lon=" + element.lng + "&appid=722a3a55a0b7bf384f78d70a7762bc9b&units=imperial";

    if (document.querySelector('#basic-switch').checked) {
      endPoint = "https://api.openweathermap.org/data/2.5/weather?lat=" + element.lat + "&lon=" + element.lng + "&appid=722a3a55a0b7bf384f78d70a7762bc9b&units=metric";
    }
    console.log(endPoint);

    fetch(endPoint).then((res) => {
      return res.json();
    }).then((json) => {
      currentTemp = json.main.temp;

      db.saved.put({
        temp: currentTemp
      }).then(() => {
        return db.saved.get(currentTemp);
      }).then((saved) => {
        console.log("DB temp: " + saved.temp);

        if (document.querySelector('#basic-switch').checked) {
          temp.querySelector('.demo-card__title').textContent = element.title + " - Current temperature: " + saved.temp + "C";
        } else {
          temp.querySelector('.demo-card__title').textContent = element.title + " - Current temperature: " + saved.temp + "F";
        }
      }).catch((err) => {

      });
      console.log("Local temp: " + currentTemp);

      let temp = document.querySelector('#apple').cloneNode(true);
      //console.log(currentTemp);


      temp.querySelector('.cardAddress1').textContent = element.address1;
      temp.querySelector('.cardAddress2').textContent = element.address2;
      document.querySelector('#savedTab').appendChild(temp);
    });
  });
}

//pressing refresh location button
document.querySelector('#refreshSavedButton').addEventListener('click', () => {
  populateSavedList();
});
