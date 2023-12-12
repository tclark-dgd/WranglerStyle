// filter on neighborhood feature
function filterFeaturesByNeighborhood(features, neighborhoodID) {
    return features.filter(function(feature) {
        return feature.properties.NeighborhoodID === neighborhoodID;
    });
}

// Function to handle both click and search events
let selectedLayers = [];
let selectedNeighborhoodIDs = [];

function handleFeatureSelect(layer) {
    // For single-select mode, clear previous selections
    if (!isMultiSelectMode) {
        selectedLayers.forEach(selectedLayer => {
            selectedLayer.setStyle(neighborhoodLayerStyles.defaultStyle);
        });
        selectedLayers = [];
        selectedNeighborhoodIDs = [];
    }

    let layerIndex = selectedLayers.indexOf(layer);
    if (layerIndex === -1) {
        // Layer is not currently selected, so select it
        selectedLayers.push(layer);
        selectedNeighborhoodIDs.push(layer.feature.properties.NeighborhoodID);
        layer.setStyle(neighborhoodLayerStyles.clickedStyle);
    } else {
        // Layer is already selected, so deselect it
        selectedLayers.splice(layerIndex, 1);
        selectedNeighborhoodIDs.splice(layerIndex, 1);
        layer.setStyle(neighborhoodLayerStyles.defaultStyle);
    }

    // Now handle the visual appearance and bounds of selected layers
    selectedLayers.forEach(selectedLayer => {
        selectedLayer.bringToFront();
    });

    // Call these functions to update their displays based on the new selection
    handleDropdownSelect(neighborhoodAggData);

    // If there are selected layers, fit the map bounds to show all
    if (selectedLayers.length > 0) {
        let group = new L.featureGroup(selectedLayers);
        map.fitBounds(group.getBounds(), { padding: [100, 100] });
    }

    // Remove any existing network layers
    if (window.edgesLayer) { map.removeLayer(window.edgesLayer); }
    if (window.nodesLayer) { map.removeLayer(window.nodesLayer); }

    // Now plot network edges and nodes for all selected neighborhoods
    if (selectedNeighborhoodIDs.length > 0) {
        plotNetworkEdges(selectedNeighborhoodIDs, neighborhoodEdges);
        plotNetworkNodes(selectedNeighborhoodIDs, neighborhoodNodes);
    }

    // Call this at the end of your selection logic
    const titleElement = document.getElementById('selectionTitle');
    const count = selectedNeighborhoodIDs.length;

    if (count === 1) {
        titleElement.textContent = selectedNeighborhoodIDs[0]; // Assuming this is the NeighborhoodID
    } else {
        titleElement.textContent = `${count} x Neighborhoods Selected`;
    }

    // Update table selection based on map feature selection
    updateTableSelection();
}

function updateTableSelection() {
    // Check if DataTable API is available
    if (window.dataTable) {
        const dataTableApi = new simpleDatatables.DataTable("#spreadsheetTable")

        // First, remove 'selected-row' class from all rows
        dataTableApi.rows().every(function() {
            this.node().classList.remove('selected-row');
        });

        // Then, add 'selected-row' class to rows that match selected NeighborhoodIDs
        selectedNeighborhoodIDs.forEach(neighborhoodID => {
            dataTableApi.rows().every(function() {
                var data = this.data();
                if (data[1] === neighborhoodID) { // Ensure this is the correct index for NeighborhoodID
                    this.node().classList.add('selected-row');
                }
            });
        });

        // Redraw the table to reflect the changes
        dataTableApi.draw(false); // 'false' to retain paging position
    }
}
