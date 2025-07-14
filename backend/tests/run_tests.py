"""
Test runner script
Run all tests in the tests directory
"""
import unittest
import sys
import os
import django
from django.test.utils import get_runner
from django.conf import settings

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'calendar_project.settings')
django.setup()

def run_tests():
    """Run all tests"""
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Run tests for both test modules
    test_modules = [
        'tests.test_user_endpoints',
        'tests.test_admin_endpoints'
    ]
    
    failures = test_runner.run_tests(test_modules)
    
    if failures:
        sys.exit(1)
    else:
        print("All tests passed!")

if __name__ == '__main__':
    run_tests()
