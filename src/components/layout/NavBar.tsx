
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart, Zap } from 'lucide-react';

export const NavBar = () => {
  const location = useLocation();
  
  return (
    <nav className="w-full mb-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl mb-4 md:mb-0">
            <div className="p-2 bg-secondary/50 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span>AlgoWizard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-secondary'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              to="/las-vegas"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/las-vegas' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-secondary'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Las Vegas</span>
            </Link>
            <Link 
              to="/monte-carlo"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/monte-carlo' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-secondary'
              }`}
            >
              <BarChart className="h-4 w-4" />
              <span>Monte Carlo</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
