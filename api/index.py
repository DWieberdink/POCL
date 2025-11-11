from app import app

# Vercel serverless function handler
# Vercel passes a WSGI-compatible request object
def handler(request):
    """Vercel serverless function handler for Flask app"""
    return app(request.environ, lambda status, headers: None)

# Export for Vercel
__all__ = ['handler']
