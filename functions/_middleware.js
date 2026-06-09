export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);

    // List the pages that require a password
    const protectedPaths = [
        '/continental',
        '/continental.html',
        '/alsac',
        '/alsac.html'
    ];

    // Check if the current URL exactly matches or starts with one of our protected paths
    const isProtected = protectedPaths.some(path => url.pathname === path || url.pathname.startsWith(path + '/'));

    if (isProtected) {
        // Here you can easily change your username and password!
        const username = "guest";
        const password = "NDA2026";
        
        const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;
        const authHeader = request.headers.get('Authorization');

        // If no password was provided, or if the password was wrong, trigger the browser login popup
        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized. Please enter the correct credentials to view this project.', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="NDA Restricted Project Area"',
                },
            });
        }
    }

    // If the password was correct, or if the page isn't protected, let them through normally
    return next();
}
