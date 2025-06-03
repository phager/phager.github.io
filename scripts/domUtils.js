export class DOMUtils {
    static createElement(tag, className, textContent = null) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    static createTable(className) {
        const table = this.createElement("table", className);
        const thead = this.createElement("thead");
        const tbody = this.createElement("tbody");
        table.appendChild(thead);
        table.appendChild(tbody);
        return { table, thead, tbody };
    }

    static createTableRow(cells, isHeader = false) {
        const row = this.createElement("tr");
        cells.forEach((cell) => {
            const element = this.createElement(isHeader ? "th" : "td", cell.className, cell.text);
            if (cell.colSpan) element.colSpan = cell.colSpan;
            if (cell.scope) element.scope = cell.scope;
            if (cell.style) Object.assign(element.style, cell.style);
            row.appendChild(element);
        });
        return row;
    }

    static createButton(text, className, onClick) {
        const button = this.createElement("button", className, text);
        if (onClick) button.addEventListener("click", onClick);
        return button;
    }

    static createContainer(className) {
        return this.createElement("div", className);
    }
}
