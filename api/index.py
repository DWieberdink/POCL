# Vercel serverless function handler for Flask
# Using Vercel's Python runtime with @vercel/python

from app import app

def handler(request):
    """
    Vercel serverless function handler
    Vercel's @vercel/python runtime provides a request object compatible with WSGI
    """
    # Vercel's Python runtime automatically handles WSGI conversion
    # The request object has environ attribute that Flask can use
    return app(request.environ, lambda status, headers: None)
