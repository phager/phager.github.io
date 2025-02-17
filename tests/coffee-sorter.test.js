const CoffeeTableSorter = require('../scripts.js');

describe('CoffeeTableSorter', () => {
    let sorter;
    let table;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <table id="coffeeTable">
                <tr>
                    <th></th>
                    <th class="sortable">Company ↕</th>
                    <th class="sortable">Coffee ↕</th>
                </tr>
                <tr>
                    <td></td>
                    <td>Counter Culture Coffee</td>
                    <td>Apollo</td>
                </tr>
                <tr>
                    <td></td>
                    <td>Blue Bottle Coffee</td>
                    <td>Decaf</td>
                </tr>
                <tr>
                    <td></td>
                    <td>Equator Coffee</td>
                    <td>Tigerwalk</td>
                </tr>
            </table>
        `;
        
        sorter = new CoffeeTableSorter('coffeeTable');
        table = document.getElementById('coffeeTable');
    });

    test('maintains sort state between clicks with no time dependency', () => {
        // First click - ascending
        sorter.sortTable(1);
        let companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Blue Bottle Coffee',
            'Counter Culture Coffee',
            'Equator Coffee'
        ]);

        // Simulate delay (this would have reset the state in the old version)
        jest.advanceTimersByTime(1000);

        // Second click - descending (should work regardless of time passed)
        sorter.sortTable(1);
        companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Equator Coffee',
            'Counter Culture Coffee',
            'Blue Bottle Coffee'
        ]);
    });

    test('clicking different columns resets sort cycle', () => {
        // Sort companies ascending
        sorter.sortTable(1);
        let companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Blue Bottle Coffee',
            'Counter Culture Coffee',
            'Equator Coffee'
        ]);

        // Sort coffees - should start with ascending despite previous column state
        sorter.sortTable(2);
        const coffees = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[2].textContent);
        expect(coffees).toEqual([
            'Apollo',
            'Decaf',
            'Tigerwalk'
        ]);
    });

    test('completes full sort cycle on same column', () => {
        // First click - ascending
        sorter.sortTable(1);
        let companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Blue Bottle Coffee',
            'Counter Culture Coffee',
            'Equator Coffee'
        ]);

        // Second click - descending
        sorter.sortTable(1);
        companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Equator Coffee',
            'Counter Culture Coffee',
            'Blue Bottle Coffee'
        ]);

        // Third click - original order
        sorter.sortTable(1);
        companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Counter Culture Coffee',
            'Blue Bottle Coffee',
            'Equator Coffee'
        ]);

        // Fourth click - should start cycle again with ascending
        sorter.sortTable(1);
        companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
        expect(companies).toEqual([
            'Blue Bottle Coffee',
            'Counter Culture Coffee',
            'Equator Coffee'
        ]);
    });
}); 