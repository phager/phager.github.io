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

    if (lastColumn === n && currentTime - lastClickTime < 500) {
        clickCount++;
        if (clickCount === 3) {
            // Triple click - reset to original order
            const table = document.getElementById('coffeeTable');
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

    // Original sorting logic
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("coffeeTable");
    switching = true;
    dir = clickCount === 1 ? "asc" : "desc";

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            // Get text content, handling links
            var xContent = x.textContent || x.innerText;
            var yContent = y.textContent || y.innerText;

            if (dir == "asc") {
                if (xContent.toLowerCase() > yContent.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (xContent.toLowerCase() < yContent.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
} 