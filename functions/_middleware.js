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

    const isProtected = protectedPaths.some(path => url.pathname === path || url.pathname.startsWith(path + '/'));

    if (!isProtected) {
        return next();
    }

    // --- Configuration ---
    const PASSWORD = "hireme";
    const COOKIE_NAME = "portfolio_auth";
    const COOKIE_VALUE = "authenticated"; // Simple flag. For extra security, you could hash the password.

    // Check if they are already authenticated via cookie
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader && cookieHeader.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)) {
        return next();
    }

    // Handle form submission (POST request)
    if (request.method === 'POST') {
        const formData = await request.formData();
        const submittedPassword = formData.get('password');

        if (submittedPassword === PASSWORD) {
            // Password is correct! Set a cookie that expires in 30 days and redirect them to the page they wanted.
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': url.pathname,
                    'Set-Cookie': `${COOKIE_NAME}=${COOKIE_VALUE}; Expires=${expires}; Path=/; Secure; HttpOnly; SameSite=Strict`
                }
            });
        } else {
            // Wrong password. We will render the form again with an error message below.
            return renderLoginForm(url.pathname, true);
        }
    }

    // Render the login form for GET requests without a valid cookie
    return renderLoginForm(url.pathname, false);
}

// Helper function to render a beautiful HTML login form matching your website's style
function renderLoginForm(path, showError) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Protected Project</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                background-color: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
            }
            .card {
                border: none;
                border-radius: 1rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                width: 100%;
                max-width: 400px;
                padding: 2rem;
                background: white;
            }
            .btn-primary {
                background-color: #212529;
                border-color: #212529;
                border-radius: 0.5rem;
                padding: 0.75rem;
                font-weight: 500;
            }
            .btn-primary:hover {
                background-color: #343a40;
                border-color: #343a40;
            }
            .form-control {
                border-radius: 0.5rem;
                padding: 0.75rem;
                border: 1px solid #dee2e6;
            }
            .form-control:focus {
                border-color: #212529;
                box-shadow: 0 0 0 0.25rem rgba(33,37,41,0.1);
            }
            .back-link {
                color: #6c757d;
                text-decoration: none;
                font-size: 0.875rem;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 2rem;
            }
            .back-link:hover {
                color: #212529;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/" class="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Back to Portfolio
            </a>
            <h3 class="mb-2 fw-bold">Protected Project</h3>
            <p class="text-muted mb-4">Please enter the password to view this NDA project.</p>
            
            <form method="POST" action="${path}">
                ${showError ? '<div class="alert alert-danger py-2 mb-3 border-0" style="background-color: #fff5f5; color: #dc3545; border-radius: 0.5rem; font-size: 0.875rem;">Incorrect password. Please try again.</div>' : ''}
                <div class="mb-4">
                    <input type="password" name="password" class="form-control" placeholder="Enter password..." required autofocus>
                </div>
                <button type="submit" class="btn btn-primary w-100">Unlock Project</button>
            </form>
        </div>
    </body>
    </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
}
