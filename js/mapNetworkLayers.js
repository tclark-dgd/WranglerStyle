// Modified plotNetworkEdges to accept an array of neighborhoodIDs
function plotNetworkEdges(neighborhoodIDs, neighborhoodEdges) {
    // Clear any existing edges layer
    if (window.edgesLayer) {
        map.removeLayer(window.edgesLayer);
        window.edgesLayer = null;
    }

    // Combine all edges for the selected neighborhoods
    var combinedEdges = [];
    neighborhoodIDs.forEach(function(id) {
        var edgesToPlot = filterFeaturesByNeighborhood(neighborhoodEdges.features, id);
        combinedEdges = combinedEdges.concat(edgesToPlot);
    });

    // topline data
    let totalStreetLength = 0;
    let totalTimeTravel = 0;
    
    if (combinedEdges.length > 0) {
        window.edgesLayer = L.geoJSON(combinedEdges, {
            style: function(feature) {
                return edgesLayerStyles.defaultStyle;
            }
        }).addTo(map);
    }

}

// Modified plotNetworkNodes to accept an array of neighborhoodIDs
function plotNetworkNodes(neighborhoodIDs, neighborhoodNodes) {
    // Clear any existing nodes layer
    if (window.nodesLayer) {
        map.removeLayer(window.nodesLayer);
        window.nodesLayer = null;
    }

    // Object to keep track of SegmentID to Color
    var segmentColorMap = {};

    // Combine all nodes for the selected neighborhoods and assign colors
    var combinedNodesToPlot = [];
    neighborhoodIDs.forEach(function(id) {
        var nodesToPlot = filterFeaturesByNeighborhood(neighborhoodNodes.features, id);
        nodesToPlot.forEach(function(feature) {
            var segmentID = feature.properties.SegmentID;
            if (!segmentColorMap[segmentID]) {
                segmentColorMap[segmentID] = getRandomColor();
            }
        });
        combinedNodesToPlot = combinedNodesToPlot.concat(nodesToPlot);
    });

    // Create a new GeoJSON layer with the combined nodes
    window.nodesLayer = L.geoJSON(combinedNodesToPlot, {
        pointToLayer: function(feature, latlng) {
            // Use the assigned color for the SegmentID
            var segmentID = feature.properties.SegmentID;
            var color = segmentColorMap[segmentID];
            var circle = L.circle(latlng, {
                radius: 20,
                fillColor: color,
                color: '#66bdd1',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            });

            // Right-click on Google Street View
            circle.on('contextmenu', function(event) {
                var lat = event.latlng.lat;
                var lng = event.latlng.lng;
                var googleStreetViewURL = `https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;
                window.open(googleStreetViewURL, '_blank');
            });
            return circle;
        }
    });

    // Add layer to map
    window.nodesLayer.addTo(map);
}