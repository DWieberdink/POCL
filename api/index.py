# Vercel serverless function handler for Flask
# Using Vercel's Python runtime with @vercel/python

import sys
import traceback

# Add better error handling for imports
try:
    print("Starting Vercel handler...")
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.path}")
    
    from app import app
    print("Successfully imported app")
except ImportError as e:
    print(f"CRITICAL ImportError: {e}")
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"CRITICAL: Failed to import app: {e}")
    traceback.print_exc()
    sys.exit(1)

def handler(request):
    """
    Vercel serverless function handler
    Vercel's @vercel/python runtime provides a request object compatible with WSGI
    """
    try:
        print(f"Handler called with request: {type(request)}")
        # Vercel's Python runtime automatically handles WSGI conversion
        # The request object has environ attribute that Flask can use
        result = app(request.environ, lambda status, headers: None)
        print("Handler completed successfully")
        return result
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback_str = traceback.format_exc()
        print(f"ERROR in handler: {error_msg}")
        print(traceback_str)
        
        # Return error response
        try:
            from flask import Response
            return Response(
                f'Internal Server Error: {error_msg}\n\n{traceback_str}',
                status=500,
                mimetype='text/plain'
            )
        except:
            # If Flask isn't available, return a simple error
            return f'Internal Server Error: {error_msg}', 500
