export function generateTable(tableId, data) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let clickCount = 0;
    let lastColumn = -1;
    let originalRows = []; // Store original rows

    function sortTable(columnIndex) {
        // Reset click count when switching columns
        if (lastColumn !== columnIndex) {
            clickCount = 0;
        }

        clickCount++;
        lastColumn = columnIndex;

        const rows = Array.from(table.rows).slice(1); // Skip header

        if (clickCount === 1) {
            // Ascending
            rows.sort((a, b) => {
                const aText = a.cells[columnIndex].textContent.toLowerCase();
                const bText = b.cells[columnIndex].textContent.toLowerCase();
                return aText.localeCompare(bText);
            });
        } else if (clickCount === 2) {
            // Descending
            rows.sort((a, b) => {
                const aText = a.cells[columnIndex].textContent.toLowerCase();
                const bText = b.cells[columnIndex].textContent.toLowerCase();
                return bText.localeCompare(aText);
            });
        } else {
            // Reset to original order
            clickCount = 0;
            // Remove all rows except header
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Restore original rows
            originalRows.forEach((row) => {
                table.appendChild(row.cloneNode(true));
            });
            return;
        }

        // Remove existing rows (except header)
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        // Add sorted rows
        rows.forEach((row) => table.appendChild(row));
    }

    // Generate headers
    const headerRow = document.createElement("tr");
    data.headers.forEach((header, index) => {
        const th = document.createElement("th");
        th.textContent = header;
        if (header === "Company" || header === "Coffee" || header === "Tier" || header === "Date Added") {
            th.classList.add("sortable");
            th.onclick = () => sortTable(index);
            th.textContent = `${header} ↕`; // Add sort indicator
        }
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Generate and store original rows
    data.rows.forEach((row) => {
        const tr = document.createElement("tr");

        // Create cells in the order defined by headers
        data.headers.forEach(header => {
            const td = document.createElement("td");

            if (header === "") {
                // Logo column
                if (row.logo && row.logo.src) {
                    const img = document.createElement("img");
                    img.src = row.logo.src;
                    img.alt = row.logo.alt || "";
                    img.classList.add("logo");
                    td.appendChild(img);
                }
            } else if (header === "Company") {
                if (row.company) {
                    if (row.company.link) {
                        const a = document.createElement("a");
                        a.href = row.company.link;
                        a.textContent = row.company.text;
                        td.appendChild(a);
                    } else {
                        td.textContent = row.company.text;
                    }
                }
            } else if (header === "Coffee") {
                if (row.coffee) {
                    if (row.coffee.link) {
                        const a = document.createElement("a");
                        a.href = row.coffee.link;
                        a.textContent = row.coffee.text;
                        td.appendChild(a);
                    } else {
                        td.textContent = row.coffee.text;
                    }
                }
            } else if (header === "Tier") {
                td.textContent = row.tier || "";
            } else if (header === "Date Added") {
                td.textContent = row.dateAdded || "";
            } else if (header === "Title") {
                if (row.title) {
                    if (row.title.link) {
                        const a = document.createElement("a");
                        a.href = row.title.link;
                        a.textContent = row.title.text;
                        td.appendChild(a);
                        if (row.title.external) {
                            const span = document.createElement("span");
                            span.classList.add("external-link");
                            span.textContent = "(Substack)";
                            td.appendChild(span);
                        }
                    } else {
                        td.textContent = row.title.text;
                    }
                }
            } else {
                // Handle other simple fields (Publication, Year, Date)
                td.textContent = row[header.toLowerCase()] || "";
            }

            tr.appendChild(td);
        });

        table.appendChild(tr);
        originalRows.push(tr.cloneNode(true)); // Store a copy of the original row
    });
}
