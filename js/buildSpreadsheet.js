/*--------------------------------------------------------------
# Universe - Handle Neighborhood Data
--------------------------------------------------------------*/

function updateDataTable(neighborhoodData, aggData) {
    console.log("updateDataTable called");

    // Extract data for the table from neighborhoods GeoJSON
    const tableData = neighborhoodData.features.map(feature => {
        // Define universeKey at a higher scope
        const universeDropdown = document.getElementById('universeKeysDropdown');
        const universeKey = universeDropdown.value;
        console.log("Selected Universe Key:", universeKey);
        
        // matching items
        const matchingItem = aggData.find(item => item.NeighborhoodID === feature.properties.NeighborhoodID);

        // Combine data from both sources
        const combinedData = {};

        // Add any additional properties from aggData if they exist
        if (matchingItem) {
            combinedData.UniverseRank = matchingItem.Universe[universeKey].SuccessRank;
            combinedData.NeighborhoodID = feature.properties.NeighborhoodID;
            combinedData.UniverseHHs = matchingItem.Universe[universeKey].Households;
            combinedData.UniverseTier = matchingItem.Universe[universeKey].SuccessTier;
            combinedData.LastSuccessDoors = formatDate(matchingItem.Universe[universeKey].LastSuccessDoors);
        }

        return combinedData;
    });

    // Pre-sort tableData by UniverseRank in ascending order
    tableData.sort((a, b) => a.UniverseRank - b.UniverseRank);

    // Check if the DataTable already exists
    if (window.dataTable) {
        // Clear existing data and destroy the old table
        window.dataTable.destroy();
    }

    // Initialize new DataTable
    window.dataTable = new simpleDatatables.DataTable("#spreadsheetTable", {
        searchable: true,
        data: {
            headings: [
                'Rank #',
                'NeighborhoodID',
                'Universe HHs',
                'Success Tier #',
                'Last Success Doors',
            ],
            data: tableData.map(Object.values)
        }
    });
}