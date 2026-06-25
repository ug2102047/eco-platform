export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            © 2024 EcoPlatform. All rights reserved.
          </span>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            Data provided by{' '}
            <a 
              href="https://open-meteo.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Open-Meteo
            </a>
            ,{' '}
            <a 
              href="https://www.usgs.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              USGS
            </a>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
