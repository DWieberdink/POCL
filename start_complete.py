#!/usr/bin/env python3
"""
Start Perkins Eastman Employee Directory - COMPLETE VERSION
"""
import os
import sys

def main():
    print("=" * 70)
    print("Perkins Eastman Employee Directory - COMPLETE VERSION")
    print("=" * 70)
    print("🔍 SEARCH OPTIONS:")
    print("   ✅ Name Search: Type 'Douwe' to find yourself")
    print("   📁 Dropdown Filters: Practice Area, Region, Service Type")
    print("   👥 Load All: Shows all 937 employees at once")
    print("   🎯 Combined Search: Use filters + name search together")
    print("=" * 70)
    print()
    print("How to use:")
    print("  1. NAME SEARCH: Type a name in the search box")
    print("  2. FILTERS: Select Practice Area, Region, Service Type")
    print("  3. LOAD ALL: Click to see all 937 employees")
    print("  4. COMBINED: Use filters + name search for precise results")
    print("  5. CLICK: Any employee to see their project history")
    print("=" * 70)
    print()
    print("Starting the complete application...")
    print("The server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("-" * 70)
    print()
    
    # Import and run the Flask app
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"ERROR: Could not import app.py: {e}")
        print("Make sure all dependencies are installed:")
        print("pip install -r requirements.txt")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
