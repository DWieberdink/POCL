# Vercel Python handler - using correct format
# Vercel's @vercel/python provides a request object with environ attribute

def handler(request):
    """
    Handler for Vercel Python runtime
    Returns a Response object or dict
    """
    # Simple test - return HTML directly
    html = """<!DOCTYPE html>
<html>
<head>
    <title>Vercel Test</title>
</head>
<body>
    <h1>Hello from Vercel!</h1>
    <p>If you see this, the handler is working.</p>
</body>
</html>"""
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8'
        },
        'body': html
    }
