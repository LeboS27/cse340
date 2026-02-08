// Enable update button when form changes
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("#updateForm");
    
    if (form) {
        form.addEventListener("change", function () {
            const updateBtn = document.querySelector("#updateButton");
            if (updateBtn) {
                updateBtn.removeAttribute("disabled");
            }
        });
        
        // Also trigger on input events for text fields
        const textInputs = form.querySelectorAll('input[type="text"], input[type="number"], textarea');
        textInputs.forEach(input => {
            input.addEventListener("input", function() {
                const updateBtn = document.querySelector("#updateButton");
                if (updateBtn) {
                    updateBtn.removeAttribute("disabled");
                }
            });
        });
    }
});