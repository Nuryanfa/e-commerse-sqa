import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple Navbar */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    E-Commerce SQA
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                 <Link to="/register" className="bg-blue-600 text-white px-3 py-2 rounded-md font-medium hover:bg-blue-700">Daftar</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center">
          <Routes>
            <Route path="/" element={<div className="text-center p-8"><h1 className="text-4xl font-bold mb-4">Selamat Datang</h1><p>Silahkan Login atau Daftar untuk mulai berbelanja.</p></div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
