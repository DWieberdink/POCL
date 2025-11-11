#!/usr/bin/env python3
"""
Simple startup script for Perkins Eastman Employee Directory
"""
print("=" * 60)
print("Perkins Eastman Employee Directory")
print("=" * 60)
print("Starting server...")
print("The app will be available at: http://localhost:5000")
print("=" * 60)
print()

try:
    from app import app
    print("✅ App imported successfully!")
    print("🚀 Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
except Exception as e:
    print(f"❌ Error: {e}")
    input("Press Enter to exit...")
