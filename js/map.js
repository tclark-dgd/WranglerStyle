/*--------------------------------------------------------------
Network Layer Styles
--------------------------------------------------------------*/
// function to generate random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const edgesLayerStyles = {
    defaultStyle: {
        color: '#cceafa',
        weight: 2,
        opacity: 0.5
    },
};

/*--------------------------------------------------------------
Universe Choropleth Styles
--------------------------------------------------------------*/
// Define a color scale function for "SuccessTier"
function getColorForTier(tier) {
    switch (tier) {
        case 1: return '#9f1d27'; // Most intense
        case 2: return '#e3626c';
        case 3: return '#f19b62';
        case 4: return '#fed357';
        case 5: return '#fff6db';
        case 6: return '#eef2f4'; // Least intense
        default: return '#eef2f4'; // Default color for undefined tiers
    }
}

/*--------------------------------------------------------------
Initialize Map
--------------------------------------------------------------*/

// initialize leaflet map
var map = L.map('map', {
    doubleClickZoom: false,
    boxZoom: false,
    zoomControl: false,
});

/*--------------------------------------------------------------
Map Tile Layers
--------------------------------------------------------------*/

/* set after map initialization */
// set tile layer API links
const worldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Esri'});
const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'});
const darkModeMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {attribution: '© OpenStreetMap contributors, © CartoDB'});

// add in a initial tile layer at initialization
worldImagery.addTo(map);

// Function to toggle tile layers
function toggleTileLayers(layerToAdd, layersToRemove, buttonToAddClass, buttonsToRemoveClasses) {
    layersToRemove.forEach(layer => map.removeLayer(layer));
    layerToAdd.addTo(map);

    buttonToAddClass.classList.add('active');
    buttonToAddClass.classList.remove('inactive');

    buttonsToRemoveClasses.forEach(button => {
        button.classList.add('inactive');
        button.classList.remove('active');
    });
}

// Toggle tile layer views
globeButton.addEventListener('click', function() {toggleTileLayers(worldImagery, [openStreetMap, darkModeMap], globeButton, [carButton, darkModeButton]);});
carButton.addEventListener('click', function() {toggleTileLayers(openStreetMap, [worldImagery, darkModeMap], carButton, [globeButton, darkModeButton]);});
darkModeButton.addEventListener('click', function() {toggleTileLayers(darkModeMap, [worldImagery, openStreetMap], darkModeButton, [globeButton, carButton]);});

/*--------------------------------------------------------------
Toggle Tile Layer Selection
--------------------------------------------------------------*/

// Initialize selection mode and buttons
var isMultiSelectMode = false;
var buttons = {
    singleSelectButton: { element: document.getElementById('singleSelectButton'), mode: false, message: 'Neighborhood <b>selection tool</b><br> toggled to <b>single-select</b>.<br> Click on Neighborhood to select.' },
    multiSelectButton: { element: document.getElementById('multiSelectButton'), mode: true, message: 'Neighborhood <b>selection tool</b><br> toggled to <b>multi-select</b>.<br> Click to add to selection list. Click again to deselect.' },
};

// Show alert function
function showAlert(message) {
    var alert = document.getElementById('selectionToolAlert');
    alert.innerHTML = message;
    alert.style.display = 'block';
    setTimeout(function() { alert.style.display = 'none'; }, 4000);
}

// Button event listener setup
Object.keys(buttons).forEach(key => {
    var btn = buttons[key];
    btn.element.addEventListener('click', function() {
        isMultiSelectMode = btn.mode;
        Object.keys(buttons).forEach(innerKey => {
            var innerBtn = buttons[innerKey];
            if (innerBtn === btn) {
                innerBtn.element.classList.add('active');
                innerBtn.element.classList.remove('inactive');
            } else {
                innerBtn.element.classList.add('inactive');
                innerBtn.element.classList.remove('active');
            }
        });
        showAlert(btn.message);
    });
});

/*--------------------------------------------------------------
Map Universe Legend
--------------------------------------------------------------*/
// Define a function to update the legend content
function updateLegend() {
    const tiers = [
        { tier: 1, color: '#9f1d27', range: '≥ 20%', description: 'Modeled High Success' },
        { tier: 2, color: '#e3626c', range: '16% - 20%', description: 'Modeled Above Average Success' },
        { tier: 3, color: '#f19b62', range: '12% - 16%', description: 'Modeled Average Success' },
        { tier: 4, color: '#fed357', range: '8% - 12%', description: 'Modeled Below Average Success' },
        { tier: 5, color: '#fff6db', range: '0% - 8%', description: 'Modeled Low Success' },
    ];

    const legendContent = document.getElementById('legendContent');
    legendContent.innerHTML = ''; // Clear current content
    tiers.forEach((item) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('d-flex', 'align-items-center', 'mb-2'); // Bootstrap classes for styling
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${item.color}; width: 24px; height: 24px; border: 1px solid #000; margin-right: 8px;"></span>
            <span class="flex-fill">
                <strong>Tier ${item.tier}:</strong> ${item.description}
                <div class="text-muted">${item.range}</div>
            </span>
        `;

        legendContent.appendChild(legendItem);
    });
}

// Call the updateLegend function to populate the content when the page loads
document.addEventListener("DOMContentLoaded", updateLegend);

