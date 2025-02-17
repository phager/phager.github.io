export async function loadHeader(page = "") {
    const response = await fetch("/components/header.html");
    const html = await response.text();
    document.head.innerHTML = html;

    if (page === "coffee") {
        const script = document.createElement("script");
        script.src = "scripts.js";
        script.defer = true;
        document.head.appendChild(script);
    }
}

export async function loadNavigation(activePage) {
    const response = await fetch("/components/navigation.html");
    let html = await response.text();

    // Set active class on the current page's link
    html = html.replace(`href="${activePage}.html"`, `href="${activePage}.html" class="active"`);

    const navPlaceholder = document.getElementById("nav-placeholder");
    if (navPlaceholder) {
        navPlaceholder.outerHTML = html;
    }
}

export async function loadSocialLinks() {
    const response = await fetch("/components/social-links.html");
    const text = await response.text();
    document.getElementById("social-links-placeholder").innerHTML = text;
}
