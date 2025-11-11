# Vercel Python serverless function handler
# Vercel's @vercel/python runtime expects a specific format

def handler(request):
    """
    Vercel Python handler
    The request object is a WSGI-like environ dict
    """
    try:
        # Return a simple response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/html; charset=utf-8'
            },
            'body': '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello from Vercel!</h1><p>Handler is working.</p></body></html>'
        }
    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/plain'},
            'body': f'Error: {str(e)}\n{traceback.format_exc()}'
        }
