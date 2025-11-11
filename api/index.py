# Minimal test handler to debug import issues
# This will help us see what's actually failing

import sys
import traceback

print("=" * 60)
print("Vercel Handler Starting...")
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print("=" * 60)

# Test imports one by one
try:
    print("1. Testing basic imports...")
    import os
    import io
    from pathlib import Path
    print("   ✓ Basic imports OK")
except Exception as e:
    print(f"   ✗ Basic imports failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("2. Testing Flask import...")
    from flask import Flask
    print("   ✓ Flask import OK")
except Exception as e:
    print(f"   ✗ Flask import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("3. Testing Flask-CORS import...")
    from flask_cors import CORS
    print("   ✓ Flask-CORS import OK")
except Exception as e:
    print(f"   ✗ Flask-CORS import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("4. Testing openpyxl import...")
    import openpyxl
    print("   ✓ openpyxl import OK")
except Exception as e:
    print(f"   ✗ openpyxl import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("5. Testing msal import...")
    import msal
    print("   ✓ msal import OK")
except ImportError:
    print("   ⚠ msal not available (optional)")
except Exception as e:
    print(f"   ✗ msal import failed: {e}")
    traceback.print_exc()

try:
    print("6. Importing app module...")
    from app import app
    print("   ✓ App imported successfully!")
    print(f"   App type: {type(app)}")
except Exception as e:
    print(f"   ✗ App import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

print("=" * 60)
print("All imports successful!")
print("=" * 60)

def handler(request):
    """
    Vercel serverless function handler
    """
    try:
        print(f"Handler called - request type: {type(request)}")
        if hasattr(request, 'environ'):
            print(f"Request has environ: {request.environ}")
        else:
            print("Request does not have environ attribute")
            print(f"Request attributes: {dir(request)}")
        
        # Try to call the app
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
            return f'Internal Server Error: {error_msg}', 500
