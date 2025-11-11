# Vercel serverless function handler for Flask
# Using Vercel's Python runtime with @vercel/python

try:
    from app import app
except Exception as e:
    import traceback
    print(f"CRITICAL: Failed to import app: {e}")
    traceback.print_exc()
    raise

def handler(request):
    """
    Vercel serverless function handler
    Vercel's @vercel/python runtime provides a request object compatible with WSGI
    """
    try:
        # Vercel's Python runtime automatically handles WSGI conversion
        # The request object has environ attribute that Flask can use
        return app(request.environ, lambda status, headers: None)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error in handler: {error_msg}")
        print(traceback_str)
        
        # Return error response
        from flask import Response
        return Response(
            f'Internal Server Error: {error_msg}\n\n{traceback_str}',
            status=500,
            mimetype='text/plain'
        )
