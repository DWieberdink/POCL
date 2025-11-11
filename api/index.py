# Minimal test handler - test if handler works at all
import sys

# Write to stderr which should be captured
sys.stderr.write("=" * 60 + "\n")
sys.stderr.write("MINIMAL HANDLER TEST\n")
sys.stderr.write(f"Python version: {sys.version}\n")
sys.stderr.write("=" * 60 + "\n")

def handler(request):
    """Minimal test handler"""
    try:
        sys.stderr.write("Handler called!\n")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/plain'},
            'body': 'Hello from Vercel! Handler is working.'
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback_str = traceback.format_exc()
        sys.stderr.write(f"ERROR: {error_msg}\n")
        sys.stderr.write(traceback_str + "\n")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/plain'},
            'body': f'Error: {error_msg}'
        }
