import React from "react";

export default function GovernmentUploadPage() {
  return (
    <div className="min-h-screen">
      {/* Embedded HTML content as JSX */}
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="bg-[#10264d] text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Indian Flag Emblem */}
              <svg className="h-14 w-14" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
                <rect width="90" height="20" fill="#FF9933"/>
                <rect y="20" width="90" height="20" fill="#FFFFFF"/>
                <rect y="40" width="90" height="20" fill="#138808"/>
                <circle cx="45" cy="30" r="8" fill="none" stroke="#000080" strokeWidth="1.5"/>
                <g stroke="#000080" strokeWidth="1" strokeLinecap="round">
                  <path d="M45 30 L 45 22"/>
                  <path d="M45 30 L 45 38"/>
                  <path d="M45 30 L 37 30"/>
                  <path d="M45 30 L 53 30"/>
                  <path d="M45 30 L 49.53 24.47"/>
                  <path d="M45 30 L 40.47 35.53"/>
                  <path d="M45 30 L 51 27"/>
                  <path d="M45 30 L 39 33"/>
                  <path d="M45 30 L 51 33"/>
                  <path d="M45 30 L 39 27"/>
                  <path d="M45 30 L 49.53 35.53"/>
                  <path d="M45 30 L 40.47 24.47"/>
                </g>
              </svg>
              <div>
                <h1 className="text-2xl font-bold">Goods and Services Tax</h1>
                <p className="text-sm">Government of India, States and Union Territories</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs">
                <a href="#" className="hover:underline">Skip to Main Content</a> |
                <button className="text-xs">A-</button>
                <button className="text-xs">A</button>
                <button className="text-xs">A+</button>
              </div>
              <button className="bg-gray-500 text-white px-4 py-1 rounded-md text-sm font-semibold">REGISTER</button>
              <button id="headerLoginBtn" className="bg-white text-blue-800 px-4 py-1 rounded-md text-sm font-semibold">LOGIN</button>
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="bg-[#3a557d] text-white">
          <ul className="flex justify-center space-x-8 py-2 text-sm">
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Home</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Services</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">GST Law</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Downloads</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Search Taxpayer</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Help and Taxpayer Facilities</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">e-Invoice</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">News and Updates</a></li>
          </ul>
        </nav>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {/* Login Page */}
          <div id="loginPage">
            <div className="text-sm text-gray-600 mb-4">
              <a href="#" className="text-blue-600 hover:underline">Home</a> &gt; <span>Login</span>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Login</h2>
              <p className="text-sm text-red-600 mb-6">* indicates mandatory fields</p>
              <form>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="username" 
                    placeholder="Enter Username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="Enter Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  type="button" 
                  id="loginBtn"
                  className="w-32 bg-[#3a557d] hover:bg-[#10264d] text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                >
                  LOGIN
                </button>
              </form>
              <div className="flex justify-between mt-4 text-sm text-blue-600">
                <a href="#" className="hover:underline">Forgot Username</a>
                <a href="#" className="hover:underline">Forgot Password</a>
              </div>
              <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-gray-700">
                <p>
                  <span className="font-bold">ⓘ</span> First time login: If you are logging in for the first time,
                  click <a href="#" className="text-blue-600 hover:underline">here</a> to log in.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Page */}
          <div id="dashboardPage" className="hidden">
            <div className="bg-gray-100 p-3 mb-4 rounded-md flex justify-between items-center">
              <span className="font-semibold text-gray-700">Dashboard &gt; Returns</span>
              <span className="text-sm text-gray-600">🇬🇧 English</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-700">File Returns</h2>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 text-sm rounded-md">
                GSTR-2A can now be downloaded in excel/CSV
              </div>
              <p className="text-sm text-red-600 mb-6 text-right">* Indicates Mandatory Fields</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="financial-year" className="block text-sm font-medium text-gray-700">
                    Financial Year <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="financial-year"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>2024-25</option>
                    <option>2023-24</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quarter" className="block text-sm font-medium text-gray-700">
                    Quarter <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="quarter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Quarter 1 (Apr - Jun)</option>
                    <option defaultValue="">Quarter 2 (Jul - Sep)</option>
                    <option>Quarter 3 (Oct - Dec)</option>
                    <option>Quarter 4 (Jan - Mar)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="period"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>July</option>
                    <option>August</option>
                    <option defaultValue="">September</option>
                  </select>
                </div>
                <button 
                  id="searchBtn" 
                  className="bg-[#3a557d] hover:bg-[#10264d] text-white font-semibold py-2 px-4 rounded-md transition duration-300 h-10"
                >
                  SEARCH
                </button>
              </div>
            </div>
          </div>

          {/* Returns Page */}
          <div id="returnsPage" className="hidden">
            <div className="bg-gray-100 p-3 mb-4 rounded-md">
              <span className="font-semibold text-gray-700">Dashboard &gt; Returns &gt; September</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white border border-gray-300 rounded-md shadow-md">
                <div className="bg-[#10264d] text-white p-3 font-bold border-b border-gray-300">
                  Details of outward supplies of goods or services <br />
                  <span className="font-normal">GSTR1</span>
                </div>
                <div className="p-4">
                  <p className="mb-4">
                    <span className="font-semibold">Status-</span> 
                    <span className="text-red-600 font-bold">Not Filed</span>
                  </p>
                  <div className="flex space-x-4">
                    <button className="upload-btn w-full bg-[#3a557d] hover:bg-[#10264d] text-white py-2 rounded-md">
                      UPLOAD
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-300 rounded-md shadow-md">
                <div className="bg-[#10264d] text-white p-3 font-bold border-b border-gray-300">
                  Details of inward supplies liable to reverse charge <br />
                  <span className="font-normal">GSTR2</span>
                </div>
                <div className="p-4">
                  <p className="mb-4">
                    <span className="font-semibold">Status-</span> 
                    <span className="text-green-600 font-bold">Filed</span>
                  </p>
                  <div className="flex space-x-4">
                    <button className="bg-[#3a557d] text-white py-2 px-4 rounded-md" disabled>
                      FILED
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-300 rounded-md shadow-md">
                <div className="bg-[#10264d] text-white p-3 font-bold border-b border-gray-300">
                  Monthly return <br />
                  <span className="font-normal">GSTR3B</span>
                </div>
                <div className="p-4">
                  <p className="mb-4">
                    <span className="font-semibold">Status-</span> 
                    <span className="text-red-600 font-bold">Not Filed</span>
                  </p>
                  <div className="flex space-x-4">
                    <button className="upload-btn w-full bg-[#3a557d] hover:bg-[#10264d] text-white py-2 rounded-md">
                      UPLOAD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Page */}
          <div id="uploadPage" className="hidden">
            <div className="bg-gray-100 p-3 mb-4 rounded-md">
              <span className="font-semibold text-gray-700">Dashboard &gt; Returns &gt; September &gt; GSTR1 Upload</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Upload GSTR1 Return</h2>
              <p className="text-sm text-gray-600 mb-6">Upload your Excel file containing GST return details</p>
              
              <div className="mb-6">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".xlsx,.xls" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: .xlsx, .xls</p>
              </div>

              <div id="upload-progress" className="hidden mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span id="progress-percent">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div id="progress-bar" className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '0%'}}></div>
                </div>
              </div>

              <div id="upload-success" className="hidden mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>File uploaded successfully! Your return has been submitted to the GST portal.</span>
              </div>

              <div className="flex space-x-4">
                <button 
                  id="submit-btn" 
                  className="bg-[#3a557d] hover:bg-[#10264d] text-white font-semibold py-2 px-6 rounded-md transition duration-300"
                >
                  SUBMIT RETURN
                </button>
                <button 
                  id="back-btn" 
                  className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-md transition duration-300 hover:bg-gray-600"
                >
                  BACK
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* JavaScript functionality converted to React useEffect */}
      <GovernmentPortalScript />
    </div>
  );
}

// Separate component for JavaScript functionality
function GovernmentPortalScript() {
  React.useEffect(() => {
    // JavaScript for page navigation
    let currentStep = "login";

    const pages = {
      login: document.getElementById('loginPage'),
      dashboard: document.getElementById('dashboardPage'),
      returns: document.getElementById('returnsPage'),
      upload: document.getElementById('uploadPage')
    };

    function showPage(pageKey: string) {
      Object.values(pages).forEach(page => page?.classList.add('hidden'));
      pages[pageKey as keyof typeof pages]?.classList.remove('hidden');
      currentStep = pageKey;
    }

    // Login functionality
    const loginBtn = document.getElementById('loginBtn');
    loginBtn?.addEventListener('click', function() {
      const username = (document.getElementById('username') as HTMLInputElement)?.value;
      const password = (document.getElementById('password') as HTMLInputElement)?.value;
      
      if (!username || !password) {
        alert('Please enter both username and password');
        return;
      }
      
      showPage('dashboard');
    });

    // Header login button
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    headerLoginBtn?.addEventListener('click', function() {
      showPage('login');
    });

    // Search button
    const searchBtn = document.getElementById('searchBtn');
    searchBtn?.addEventListener('click', function() {
      showPage('returns');
    });

    // Upload buttons
    document.querySelectorAll('.upload-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        showPage('upload');
      });
    });

    // Back button
    const backBtn = document.getElementById('back-btn');
    backBtn?.addEventListener('click', function() {
      showPage('returns');
    });

    // File upload and submit
    const submitBtn = document.getElementById('submit-btn');
    submitBtn?.addEventListener('click', function() {
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (!file) {
        alert('Please select an Excel file first');
        return;
      }

      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Show progress
      document.getElementById('upload-progress')?.classList.remove('hidden');
      if (submitBtn) {
        (submitBtn as HTMLButtonElement).disabled = true;
        submitBtn.textContent = 'Uploading...';
      }

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressPercent) progressPercent.textContent = progress + '%';

        if (progress >= 100) {
          clearInterval(interval);
          document.getElementById('upload-progress')?.classList.add('hidden');
          document.getElementById('upload-success')?.classList.remove('hidden');
          if (submitBtn) {
            submitBtn.textContent = 'SUBMIT RETURN';
            (submitBtn as HTMLButtonElement).disabled = false;
          }
        }
      }, 200);
    });

    // Cleanup function
    return () => {
      loginBtn?.removeEventListener('click', () => {});
      headerLoginBtn?.removeEventListener('click', () => {});
      searchBtn?.removeEventListener('click', () => {});
      backBtn?.removeEventListener('click', () => {});
      submitBtn?.removeEventListener('click', () => {});
    };
  }, []);

  return null; // This component doesn't render anything
}