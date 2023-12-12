
/*--------------------------------------------------------------
# Neighborhood Layer Styles
--------------------------------------------------------------*/
// neighborhoods select/deselct styles - used on neighborhoods layer
const neighborhoodLayerStyles = {
    defaultStyle: {
        color: "#66bdd1",
        fillColor: "#f6f6fe",
        fillOpacity: 0.2,
        weight: 2
    },
    clickedStyle: {
        color: "#f59917",
        fillColor: "#ffe69f",
        fillOpacity: 0.2,
    },
    warningStyle: {
        color: "#d71f2d",
        fillColor: 'url(#diagonalHatchWarning)',
        fillOpacity: 0.5,
        weight: 2
    },
    longDriveStyle: {
        color: "#efa",
        fillColor: 'url(#diagonalHatchLong)',
        fillOpacity: 0.5,
        weight: 2
    },
    shortDriveStyle: {
        color: "#2eca6a",
        fillColor: "#2eca6a",
        fillOpacity: 0.2,
        weight: 2
    },
};

// Function to determine the correct style for a feature
function getFeatureStyle(feature, isSelected) {
    if (isSelected) {
        return neighborhoodLayerStyles.clickedStyle;
    } else if (feature.properties.HighIndicatorForReview === 1) {
        return neighborhoodLayerStyles.warningStyle;
    } else {
        return neighborhoodLayerStyles.defaultStyle;
    }
}

// Function to add neighborhoods layer
var neighborhoodsLayer;
var neighborhoodsLayerLabels = []; // empty label set placeholder
function addNeighborhoodsLayer(neighborhoodData) {
    neighborhoodsLayer = L.geoJSON(neighborhoodData, {
        style: function(feature) {
            return getFeatureStyle(feature, false);
        },
        onEachFeature: function(feature, layer) {
            // Create a label and bind it to the layer, but do not add it to the map yet
            var label = L.marker(layer.getBounds().getCenter(), {
                icon: L.divIcon({
                    className: 'label',
                    html: feature.properties.NeighborhoodID,
                    iconSize: [100, 40]
                })
            });

            // Check if the feature should have a warning marker
            if (feature.properties.HighIndicatorForReview === 1) {
                // Create a red icon
                var redIcon = new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41], // size of the icon
                    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
                    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
                    shadowSize: [41, 41] // size of the shadow
                });

                // Create the marker with the red icon and add it to the map
                var warningMarker = L.marker(layer.getBounds().getCenter(), { icon: redIcon });

                // Bind a tooltip to the marker
                warningMarker.bindTooltip(
                    `<strong>${feature.properties.NeighborhoodID}</strong><br><b>Please Review:</b><br> Neighborhood marked with high indication<br> of <b>gated/apartments/poorly accessible.</b>`,
                    { permanent: false, direction: 'bottom' }
                );

                warningMarker.addTo(map);
            }

            // pause labels for zoom handle
            neighborhoodsLayerLabels.push(label);

            // event listeners for layer
            layer.on({
                click: function(e) {
                    L.DomEvent.stopPropagation(e);
                    handleFeatureSelect(layer);
                }
            });
        }
    }).addTo(map);

    // Fit map bounds to neighborhood layer
    map.fitBounds(neighborhoodsLayer.getBounds());
}

// label visibility function
function updateLabelsVisibility() {
    if (map.getZoom() > 13) {
        // if over, add labels
        neighborhoodsLayerLabels.forEach(function(label) {if (!map.hasLayer(label)) {label.addTo(map);}});
    } else {
        // if under, remove labels
        neighborhoodsLayerLabels.forEach(function(label) {if (map.hasLayer(label)) {map.removeLayer(label);}});
    }
}

// Add the listener for the map's 'zoomend' event
map.on('zoomend', updateLabelsVisibility);
