<script>
    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('yearToggle');
        const wrapper = toggle.closest('.dropdown-container'); // Get the parent wrapper
        const dropdownList = document.getElementById('yearList');

        // Function to toggle the dropdown
        function toggleDropdown() {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            wrapper.classList.toggle('show-dropdown'); // Toggle the class on the wrapper
            toggle.setAttribute('aria-expanded', !isExpanded); // Update ARIA attribute
        }

        // Event listener for clicking the toggle button
        toggle.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior (# jump)
            toggleDropdown();
        });

        // Event listener to close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            // Check if the click occurred outside the dropdown wrapper
            if (!wrapper.contains(event.target) && wrapper.classList.contains('show-dropdown')) {
                toggleDropdown(); // Close the dropdown
            }
        });
    });
</script>