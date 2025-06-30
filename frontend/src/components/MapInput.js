// src/components/MapInput.js
import React, { useState, useCallback, useRef, useEffect } from 'react'; // Import useEffect
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 17.0000,
  lng: 81.0000
};

const libraries = ["places"];

// Add initialCenter prop
function MapInput({ onLocationSelect, initialCenter }) {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const searchBoxRef = useRef(null);

  // Set initial marker position when component mounts or initialCenter changes
  useEffect(() => {
    if (initialCenter) {
      setMarkerPosition(initialCenter);
    } else {
      setMarkerPosition(defaultCenter); // Or null if no default for new forms
    }
  }, [initialCenter]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
    // If there's an initial marker, fit bounds to it
    if (markerPosition) {
        const bounds = new window.google.maps.LatLngBounds(markerPosition);
        map.fitBounds(bounds);
        map.setZoom(15); // A reasonable zoom level for a specific location
    } else {
        // For new donations, set a default zoom/center
        map.setZoom(10);
        map.setCenter(defaultCenter);
    }
  }, [markerPosition]); // Depend on markerPosition to ensure map centers correctly

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMarkerDragEnd = useCallback((e) => {
     const newLat = e.latLng.lat();
     const newLng = e.latLng.lng();
     setMarkerPosition({ lat: newLat, lng: newLng });
     performReverseGeocode({ lat: newLat, lng: newLng });
  }, []);

  const onPlacesChanged = useCallback(() => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) {
      return;
    }
    const place = places[0];
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    setMarkerPosition(location);
    if (map) { // Ensure map is loaded before panning
      map.panTo(location);
      map.setZoom(15); // Zoom in on the selected place
    }

    const addressComponents = {
      address_line: '',
      city: '',
      state: '',
      zipcode: '',
      latitude: location.lat,
      longitude: location.lng
    };

    for (const component of place.address_components) {
      if (component.types.includes('street_number') || component.types.includes('route')) {
        addressComponents.address_line += component.long_name + ' ';
      }
      if (component.types.includes('locality')) {
        addressComponents.city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        addressComponents.state = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        addressComponents.zipcode = component.long_name;
      }
    }
    addressComponents.address_line = addressComponents.address_line.trim();

    if (onLocationSelect) {
      onLocationSelect(addressComponents);
    }
  }, [map, onLocationSelect]);

  const performReverseGeocode = useCallback(async (latLng) => {
     if (!window.google) {
         console.error("Google Maps API not loaded for geocoding.");
         return;
     }
     const geocoder = new window.google.maps.Geocoder();
     geocoder.geocode({ 'location': latLng }, (results, status) => {
         if (status === 'OK' && results[0]) {
             const place = results[0];
             const addressComponents = {
                 address_line: '', city: '', state: '', zipcode: '',
                 latitude: latLng.lat, longitude: latLng.lng
             };

             for (const component of place.address_components) {
                 if (component.types.includes('street_number') || component.types.includes('route')) {
                     addressComponents.address_line += component.long_name + ' ';
                 }
                 if (component.types.includes('locality')) {
                     addressComponents.city = component.long_name;
                 }
                 if (component.types.includes('administrative_area_level_1')) {
                     addressComponents.state = component.short_name;
                 }
                 if (component.types.includes('postal_code')) {
                     addressComponents.zipcode = component.long_name;
                 }
             }
             addressComponents.address_line = addressComponents.address_line.trim();

             if (onLocationSelect) {
                 onLocationSelect(addressComponents);
             }
         } else {
             console.error('Geocoder failed due to: ' + status);
             if (onLocationSelect) {
                 onLocationSelect({
                     address_line: '', city: '', state: '', zipcode: '',
                     latitude: latLng.lat, longitude: latLng.lng
                 });
             }
         }
     });
  }, [onLocationSelect]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_Maps_API_KEY}
      libraries={libraries}
      loadingElement={<p>Loading Maps...</p>}
      id="google-map-script"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || initialCenter || defaultCenter} // Use initialCenter
        zoom={markerPosition ? 15 : (initialCenter ? 15 : 10)}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={useCallback((e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          setMarkerPosition({ lat: newLat, lng: newLng });
          performReverseGeocode({ lat: newLat, lng: newLng });
        }, [performReverseGeocode])}
      >
        <StandaloneSearchBox
          onLoad={ref => searchBoxRef.current = ref}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a location"
            style={{
              boxSizing: `border-box`, border: `1px solid transparent`, width: `240px`,
              height: `32px`, padding: `0 12px`, borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`, fontSize: `14px`,
              outline: `none`, textOverflow: `ellipses`, position: "absolute",
              left: "50%", marginLeft: "-120px", marginTop: "10px", zIndex: 100
            }}
          />
        </StandaloneSearchBox>

        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapInput;