class CoffeeTableSorter {
    constructor(tableId) {
        this.table = document.getElementById(tableId);
        this.clickCount = 0;
        this.lastColumn = -1;
        this.originalRows = [];

        // Store original order when page loads
        if (this.table) {
            this.originalRows = Array.from(this.table.rows)
                .slice(1) // Skip header row
                .map((row) => row.cloneNode(true));
        }
    }

    sortTable(columnIndex) {
        // Reset click count only when switching to a different column
        if (this.lastColumn !== columnIndex) {
            this.clickCount = 0;
        }

        this.clickCount++;
        this.lastColumn = columnIndex;

        // Handle the three different states
        if (this.clickCount === 1) {
            this.sort(columnIndex, "asc");
        } else if (this.clickCount === 2) {
            this.sort(columnIndex, "desc");
        } else {
            this.resetToOriginal();
            this.clickCount = 0;
        }
    }

    sort(columnIndex, direction) {
        const rows = Array.from(this.table.rows).slice(1); // Skip header
        const sorted = rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.toLowerCase();
            const bText = b.cells[columnIndex].textContent.toLowerCase();
            return direction === "asc" ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });

        // Remove existing rows (except header)
        while (this.table.rows.length > 1) {
            this.table.deleteRow(1);
        }

        // Add sorted rows
        sorted.forEach((row) => this.table.appendChild(row));
    }

    resetToOriginal() {
        // Remove all rows except header
        while (this.table.rows.length > 1) {
            this.table.deleteRow(1);
        }
        // Restore original rows
        this.originalRows.forEach((row) => {
            this.table.appendChild(row.cloneNode(true));
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    const sorter = new CoffeeTableSorter("coffeeTable");

    // Update onclick handlers in the HTML
    const headers = document.querySelectorAll(".sortable");
    headers.forEach((header, index) => {
        header.onclick = () => sorter.sortTable(index + 1);
    });
});

// Export for testing (only if module exists - i.e., in Node.js environment)
if (typeof module !== "undefined" && module.exports) {
    module.exports = CoffeeTableSorter;
}
