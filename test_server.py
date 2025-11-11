#!/usr/bin/env python3
"""
Test if the Flask server is running
"""
import requests
import time

def test_server():
    try:
        response = requests.get('http://localhost:5000', timeout=5)
        if response.status_code == 200:
            print("✅ Server is running at http://localhost:5000")
            print("✅ You can now open your browser and go to:")
            print("   http://localhost:5000")
            return True
        else:
            print(f"❌ Server responded with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running yet. Please wait a moment and try again.")
        return False
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False

if __name__ == "__main__":
    print("Testing if the Perkins Eastman Employee Directory server is running...")
    test_server()
