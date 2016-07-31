function initAutocomplete() {
  if(!window.location.href.endsWith('admin')) {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -43.530988, lng: 172.636532},
      zoom: 13,
      mapTypeId: 'roadmap',
      disableDefaultUI: true
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var button = document.getElementById('pac-go-to-next');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(button);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var marker = new google.maps.Marker({
      map: map,
      position: map.center
    });

    map.addListener('click', function(event) {
      marker.setPosition(event.latLng);
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // For each place, get the icon, name and location.
      var place = places[0];
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      // Create a marker for each place.
      marker.setPosition(place.geometry.location);

      if(!map.getBounds().contains(place.geometry.location)) {
        map.setCenter(place.geometry.location);
        map.setZoom(13);
      }
    });

    button.addEventListener("click", function(e) {
      var elevator = new google.maps.ElevationService;
      elevator.getElevationForLocations({
        'locations': [marker.getPosition()]
      }, function(results, status) {
        if(status=='OK') {
          if(results[0]) {
            document.getElementById("yourlevel").innerHTML = (results[0].elevation+8).toFixed(1);
          }
        } else {
          console.log(status);
        }
      });
      document.getElementById('map-container').style.display = "none";
      document.getElementById('flood-data').style.display = "block";
    });
  }
}
