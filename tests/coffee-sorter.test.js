import { generateTable } from '../scripts/tableGenerator.js';

describe('Table Generator and Sorting', () => {
    let table;
    const testData = {
        headers: ['', 'Company', 'Coffee'],
        rows: [
            {
                logo: { src: 'test1.jpg', alt: 'Test Logo 1' },
                company: { text: 'Counter Culture Coffee', link: 'https://test1.com' },
                coffee: { text: 'Apollo', link: 'https://test1.com/apollo' }
            },
            {
                logo: { src: '', alt: '' },
                company: { text: 'Blue Bottle Coffee', link: 'https://test2.com' },
                coffee: { text: 'Decaf', link: 'https://test2.com/decaf' }
            },
            {
                logo: { src: '', alt: '' },
                company: { text: 'Equator Coffee', link: 'https://test3.com' },
                coffee: { text: 'Tigerwalk', link: 'https://test3.com/tigerwalk' }
            }
        ]
    };

    beforeEach(() => {
        document.body.innerHTML = '<table id="testTable"></table>';
        table = document.getElementById('testTable');
        generateTable('testTable', testData);
    });

    test('generates table with correct structure', () => {
        expect(table.rows.length).toBe(4); // header + 3 data rows
        expect(table.rows[0].cells.length).toBe(3); // 3 columns
        
        // Check headers
        const headers = Array.from(table.rows[0].cells).map(cell => cell.textContent.replace(' ↕', ''));
        expect(headers).toEqual(['', 'Company', 'Coffee']);
        
        // Check sortable headers
        expect(table.rows[0].cells[1].classList.contains('sortable')).toBe(true);
        expect(table.rows[0].cells[2].classList.contains('sortable')).toBe(true);
    });

    test('first click sorts company column ascending', () => {
        table.rows[0].cells[1].click(); // Click Company header
        
        const companies = Array.from(table.rows)
            .slice(1) // Skip header
            .map(row => row.cells[1].textContent);
            
        expect(companies).toEqual([
            'Blue Bottle Coffee',
            'Counter Culture Coffee',
            'Equator Coffee'
        ]);
    });

    test('second click sorts company column descending', () => {
        const companyHeader = table.rows[0].cells[1];
        companyHeader.click(); // First click
        companyHeader.click(); // Second click
        
        const companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
            
        expect(companies).toEqual([
            'Equator Coffee',
            'Counter Culture Coffee',
            'Blue Bottle Coffee'
        ]);
    });

    test('third click restores original order', () => {
        const companyHeader = table.rows[0].cells[1];
        companyHeader.click(); // First click
        companyHeader.click(); // Second click
        companyHeader.click(); // Third click
        
        const companies = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[1].textContent);
            
        expect(companies).toEqual([
            'Counter Culture Coffee',
            'Blue Bottle Coffee',
            'Equator Coffee'
        ]);
    });

    test('clicking different columns resets sort state', () => {
        const companyHeader = table.rows[0].cells[1];
        const coffeeHeader = table.rows[0].cells[2];
        
        companyHeader.click(); // Sort companies ascending
        coffeeHeader.click(); // Should sort coffees ascending
        
        const coffees = Array.from(table.rows)
            .slice(1)
            .map(row => row.cells[2].textContent);
            
        expect(coffees).toEqual([
            'Apollo',
            'Decaf',
            'Tigerwalk'
        ]);
    });

    test('renders links correctly', () => {
        const firstRow = table.rows[1];
        const companyLink = firstRow.cells[1].querySelector('a');
        
        expect(companyLink.href).toBe('https://test1.com/');
        expect(companyLink.textContent).toBe('Counter Culture Coffee');
    });

    test('renders images correctly', () => {
        const firstRow = table.rows[1];
        const logo = firstRow.cells[0].querySelector('img');
        
        expect(logo.src).toContain('test1.jpg');
        expect(logo.alt).toBe('Test Logo 1');
        expect(logo.classList.contains('logo')).toBe(true);
    });
}); 