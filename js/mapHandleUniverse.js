/*--------------------------------------------------------------
# Universe - Create Dropdown
--------------------------------------------------------------*/
function createUniverseDropdown(aggData) {
    const allUniverseKeys = new Set(); // Use a Set to store unique keys
    const universeDropdown = document.getElementById('universeKeysDropdown');

    aggData.forEach(item => {
        if (item.Universe) {
            const keys = Object.keys(item.Universe);
            keys.forEach(key => allUniverseKeys.add(key));
        }
    });

    // add options to the dropdown
    allUniverseKeys.forEach(key => {
        const universeOption = document.createElement('option');
        universeOption.value = key;
        universeOption.textContent = key;
        universeDropdown.appendChild(universeOption);
    });

    // Function to apply the choropleth colors based on "SuccessTier"
    function styleFeature(feature) {
        // Find the corresponding item in neighborhoodAggData by NeighborhoodID
        var aggDataItem = aggData.find(item => item.NeighborhoodID === feature.properties.NeighborhoodID);
        if (aggDataItem && aggDataItem.Universe) {
            var selectedKey = universeDropdown.value; // The selected key from the dropdown
            var successTier = aggDataItem.Universe[selectedKey] ? aggDataItem.Universe[selectedKey].SuccessTier : undefined;
            return {
                fillColor: getColorForTier(successTier),
                weight: 0,
                opacity: 0,
                fillOpacity: 0.5
            };
        }
        return { // Default style if no match found
                weight: 0,
                opacity: 0,
                fillOpacity: 0
        };
    }

    // Assuming 'choroplethLayer' is a global variable that holds your choropleth layer
    let choroplethLayer;

    function toggleChoroplethLayer(show) {
        if (show) {
            // Check if choroplethLayer is already added to the map
            if (!map.hasLayer(choroplethLayer)) {
                choroplethLayer.addTo(map);
            }
        } else {
            if (map.hasLayer(choroplethLayer)) {
                choroplethLayer.remove();
            }
        }
    }

    // Add event listeners to buttons
    document.getElementById('toggleOnButton').addEventListener('click', function() {
        toggleChoroplethLayer(true);
        this.classList.add('active');
        this.classList.remove('inactive');
        document.getElementById('toggleOffButton').classList.add('inactive');
        document.getElementById('toggleOffButton').classList.remove('active');
    });

    document.getElementById('toggleOffButton').addEventListener('click', function() {
        toggleChoroplethLayer(false);
        this.classList.add('active');
        this.classList.remove('inactive');
        document.getElementById('toggleOnButton').classList.add('inactive');
        document.getElementById('toggleOnButton').classList.remove('active');
    });

    // Update the 'updateChoropleth' function
    function updateChoropleth() {
        if (choroplethLayer) {
            choroplethLayer.remove();
        }
        choroplethLayer = L.geoJSON(neighborhoodGeoJSON, {
            style: styleFeature,
            className: 'click-through-layer'
        }).addTo(map);

        // Send the choropleth layer to the back
        choroplethLayer.bringToBack();
    }

    // Event listener for dropdown selection change
    universeDropdown.addEventListener('change', function() {updateChoropleth();});
    updateChoropleth()
}

// Define the function to format date from an integer yyyymmdd to mm/dd/yyyy string
const formatDate = (dateInt) => {
    if (dateInt && dateInt > 19000101) { // Assuming 19000101 is your initial "very early date" value
        const dateStr = dateInt.toString();
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${month}/${day}/${year}`;
    } else {
        return 'N/A'; // or any other placeholder for non-existent dates
    }
};

/*--------------------------------------------------------------
# Universe - Handle Dropdown Select
--------------------------------------------------------------*/
function handleDropdownSelect(aggData) {
    // topline data
    let allVoters = 0;
    let allHouseholds = 0;

    // assign topline registration data
    aggData.forEach(item => {
        if (!selectedNeighborhoodIDs.length || selectedNeighborhoodIDs.includes(item.NeighborhoodID)) {
            allVoters += item.Registration.Voters || 0;
            allHouseholds += item.Registration.Households || 0;
        }
    });

    // add to html doc
    document.getElementById('reg-content2').textContent = allHouseholds.toLocaleString();
    document.getElementById('reg-content3').textContent = allVoters.toLocaleString();

    // get selected universe key
    const universeDropdown = document.getElementById('universeKeysDropdown');
    var universeKey = universeDropdown.value;
    let universeVoters = 0;
    let universeHouseholds = 0;
    let lastContactDoors = '19000101';
    let lastContactPhones = '19000101';

    // update universe selected
    const targetsContentElements = document.querySelectorAll('.targets-content1');
    targetsContentElements.forEach(function(element) {
        element.textContent = universeKey;
    });

    // aggregate over selected data
    aggData.forEach(item => {
        if ((!selectedNeighborhoodIDs.length || selectedNeighborhoodIDs.includes(item.NeighborhoodID)) &&
            item.Universe && item.Universe[universeKey]) {
            universeVoters += item.Universe[universeKey].Voters || 0;
            universeHouseholds += item.Universe[universeKey].Households || 0;
            
            // Take the max value and then format into date format
            if (item.Universe[universeKey].LastSuccessDoors && item.Universe[universeKey].LastSuccessDoors > lastContactDoors) {
                lastContactDoors = item.Universe[universeKey].LastSuccessDoors;
            }
            if (item.Universe[universeKey].LastSuccessPhones && item.Universe[universeKey].LastSuccessPhones > lastContactPhones) {
                lastContactPhones = item.Universe[universeKey].LastSuccessPhones;
            }
        }
    });

    // aggregate over selected data
    document.getElementById('targets-content2').textContent = universeHouseholds.toLocaleString();
    document.getElementById('targets-content3').textContent = universeVoters.toLocaleString();

    // Update the HTML with formatted dates
    document.getElementById('survey-content2').textContent = formatDate(lastContactPhones);
    document.getElementById('survey-content3').textContent = formatDate(lastContactDoors);
}