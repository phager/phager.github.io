export async function loadHeader(page = '') {
    const response = await fetch('/components/header.html');
    const html = await response.text();
    document.head.innerHTML = html;
    
    if (page === 'coffee') {
        const script = document.createElement('script');
        script.src = 'scripts.js';
        script.defer = true;
        document.head.appendChild(script);
    }
} 