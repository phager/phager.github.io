// Store original order when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.originalRows = Array.from(document.getElementById('coffeeTable').rows)
        .slice(1) // Skip header row
        .map(row => row.cloneNode(true));
});

let clickCount = 0;
let lastClickTime = 0;
let lastColumn = -1;

function sortTable(n) {
    const currentTime = new Date().getTime();
    const table = document.getElementById('coffeeTable');

    // Handle triple-click reset
    if (lastColumn === n && currentTime - lastClickTime < 500) {
        clickCount++;
        if (clickCount === 3) {
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            originalRows.forEach(row => {
                table.appendChild(row.cloneNode(true));
            });
            clickCount = 0;
            lastClickTime = 0;
            return;
        }
    } else {
        clickCount = 1;
    }

    lastClickTime = currentTime;
    lastColumn = n;

    // Sorting logic
    let switching = true;
    let dir = clickCount === 1 ? "asc" : "desc";
    
    while (switching) {
        switching = false;
        const rows = table.rows;

        for (let i = 1; i < rows.length - 1; i++) {
            let shouldSwitch = false;
            const x = rows[i].getElementsByTagName("TD")[n];
            const y = rows[i + 1].getElementsByTagName("TD")[n];

            const xContent = x.textContent || x.innerText;
            const yContent = y.textContent || y.innerText;

            if (dir === "asc") {
                if (xContent.toLowerCase() > yContent.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (xContent.toLowerCase() < yContent.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                break;
            }
        }
    }
} 