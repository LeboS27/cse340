
// Inventory Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const classificationSelect = document.getElementById('classificationList');
    const inventoryTable = document.getElementById('inventoryDisplay');
    
    // Clear any existing table content
    inventoryTable.innerHTML = '';
    
    // Function to fetch and display inventory data
    async function fetchInventoryData(classificationId) {
        try {
            // Show loading state
            inventoryTable.innerHTML = '<tr><td colspan="6" class="loading">Loading inventory data...</td></tr>';
            
            // Fetch inventory data from the server
            const response = await fetch(`/inv/getInventory/${classificationId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const inventoryData = await response.json();
            
            // Display the inventory data
            displayInventoryData(inventoryData);
            
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            inventoryTable.innerHTML = '<tr><td colspan="6" class="error">Error loading inventory data. Please try again.</td></tr>';
        }
    }
    
    // Function to display inventory data in the table
    function displayInventoryData(data) {
        if (!data || data.length === 0) {
            inventoryTable.innerHTML = '<tr><td colspan="6" class="no-data">No inventory items found for this classification.</td></tr>';
            return;
        }
        
        // Create table header
        let tableHTML = `
            <thead>
                <tr>
                    <th>Vehicle</th>
                    <th>Year</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        // Create table rows for each inventory item
        data.forEach(item => {
            const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(item.inv_price);
            
            tableHTML += `
                <tr>
                    <td><img src="${item.inv_thumbnail}" alt="${item.inv_make} ${item.inv_model}" class="thumbnail"></td>
                    <td>${item.inv_year}</td>
                    <td>${item.inv_make}</td>
                    <td>${item.inv_model}</td>
                    <td>${formattedPrice}</td>
                    <td class="actions">
                        <a href="/inv/detail/${item.inv_id}" class="btn-view">View</a>
                        <a href="/inv/edit/${item.inv_id}" class="btn-edit">Edit</a>
                        <button class="btn-delete" data-id="${item.inv_id}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody>';
        inventoryTable.innerHTML = tableHTML;
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const invId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this inventory item?')) {
                    deleteInventoryItem(invId);
                }
            });
        });
    }
    
    // Function to delete an inventory item
    async function deleteInventoryItem(invId) {
        try {
            const response = await fetch(`/inv/delete/${invId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Refresh the inventory data
                const currentClassificationId = classificationSelect.value;
                if (currentClassificationId) {
                    fetchInventoryData(currentClassificationId);
                }
            } else {
                throw new Error('Failed to delete inventory item');
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            alert('Error deleting inventory item. Please try again.');
        }
    }
    
    // Event listener for classification select change
    classificationSelect.addEventListener('change', function() {
        const selectedClassificationId = this.value;
        
        if (selectedClassificationId) {
            fetchInventoryData(selectedClassificationId);
        } else {
            // Clear the table if no classification is selected
            inventoryTable.innerHTML = '';
        }
    });
    
    if (classificationSelect.value) {
        fetchInventoryData(classificationSelect.value);
    }
});
