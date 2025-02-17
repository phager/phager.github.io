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
            originalRows.forEach(row => {
                table.appendChild(row.cloneNode(true));
            });
            return;
        }

        // Remove existing rows (except header)
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        // Add sorted rows
        rows.forEach(row => table.appendChild(row));
    }

    // Generate headers
    const headerRow = document.createElement('tr');
    data.headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        if (header === 'Company' || header === 'Coffee') {
            th.classList.add('sortable');
            th.onclick = () => sortTable(index);
            th.textContent = `${header} ↕`; // Add sort indicator
        }
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Generate and store original rows
    data.rows.forEach(row => {
        const tr = document.createElement('tr');
        
        Object.values(row).forEach(cell => {
            const td = document.createElement('td');
            
            if (typeof cell === 'string') {
                td.textContent = cell;
            } else if (cell.src !== undefined) {
                if (cell.src) {
                    const img = document.createElement('img');
                    img.src = cell.src;
                    img.alt = cell.alt;
                    img.classList.add('logo');
                    td.appendChild(img);
                }
            } else if (cell.link) {
                const a = document.createElement('a');
                a.href = cell.link;
                a.textContent = cell.text;
                td.appendChild(a);
                
                if (cell.external) {
                    const span = document.createElement('span');
                    span.classList.add('external-link');
                    span.textContent = '(Substack)';
                    td.appendChild(span);
                }
            } else if (cell.text) {
                td.textContent = cell.text;
            }
            
            tr.appendChild(td);
        });
        
        table.appendChild(tr);
        originalRows.push(tr.cloneNode(true)); // Store a copy of the original row
    });
} 