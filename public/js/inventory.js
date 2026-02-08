// Get a list of items in inventory based on the classification_id
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners');
    
    let classificationList = document.querySelector("#classificationList");
    
    if (classificationList) {
        console.log('Classification list found, adding event listener');
        
        classificationList.addEventListener("change", function () {
            let classification_id = classificationList.value;
            console.log(`classification_id is: ${classification_id}`);
            
            if (!classification_id) {
                console.log('No classification selected, clearing table');
                document.getElementById("inventoryDisplay").innerHTML = '';
                return;
            }
            
            let classIdURL = "/inv/getInventory/" + classification_id;
            console.log('Fetching from:', classIdURL);
            
            fetch(classIdURL)
                .then(function (response) {
                    if (response.ok) {
                        return response.json();
                    }
                    throw Error("Network response was not OK");
                })
                .then(function (data) {
                    console.log('Data received:', data);
                    buildInventoryList(data);
                })
                .catch(function (error) {
                    console.log('There was a problem: ', error.message);
                    document.getElementById("inventoryDisplay").innerHTML = 
                        '<tr><td colspan="3" class="error">Error loading inventory data. Please try again.</td></tr>';
                })
        });
        
        // Trigger change event if there's a default selection
        if (classificationList.value) {
            classificationList.dispatchEvent(new Event('change'));
        }
    } else {
        console.error('Classification list element not found!');
    }
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");
    
    if (!data || data.length === 0) {
        inventoryDisplay.innerHTML = '<tr><td colspan="3" class="no-data">No inventory items found for this classification.</td></tr>';
        return;
    }
    
    // Set up the table labels
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '</thead>';
    
    // Set up the table body
    dataTable += '<tbody>';
    
    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element) {
        console.log(element.inv_id + ", " + element.inv_model);
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
        dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
        dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
    })
    
    dataTable += '</tbody>';
    
    // Display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable;
}