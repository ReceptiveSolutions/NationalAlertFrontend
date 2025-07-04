import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Logo } from '../index';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    // Current date formatting
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Secondary nav links
    const secondaryLinks = [
        { name: 'Home', path: '/' },
        { name: 'Sports', path: '/sports' },
        { name: 'Business', path: '/business' },
        { name: 'Entertainment', path: '/entertainment' },
        { name: 'Latest', path: '/latest' },
    ];

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsSearchOpen(false);
        }
    };

    return (
        <>
            {/* Main Header */}
            <header className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
                <Container className="relative">
                    {/* Top Row - Responsive Layout */}
                    <div className="flex items-center justify-between py-2 px-2 sm:px-4 lg:px-6">
                        {/* Explorer Button & Date - Left */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="flex items-center space-x-1 text-white hover:text-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer hover:bg-red-700 px-2 py-1.5 rounded-md"
                                aria-label="Explore categories"
                            >
                                <FiMenu className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden xs:inline">Explore</span> 
                            </button>
                            
                            {/* Date - Progressive visibility */}
                            <div className="hidden sm:block bg-red-700 px-2 py-1 rounded text-xs lg:text-sm">
                                <span className="hidden lg:inline">{currentDate}</span>
                                <span className="lg:hidden">
                                    {new Date().toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Logo Only - Center (Mobile Clean) */}
                        <div className="flex items-center justify-center flex-1">
                            <NavLink to="/" className="flex items-center group">
                                {/* Logo - Clean and prominent */}
                                <div className="relative flex-shrink-0">
                                    <Logo className="h-7 w-auto sm:h-8 md:h-10 lg:h-12 transition-all duration-200 group-hover:scale-105" />
                                </div>
                                
                                {/* Brand Text - Only on larger screens */}
                                <div className="text-center ml-2 hidden sm:block">
                                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">
                                        <span className="text-yellow-300">National</span>
                                        <span className="text-white mx-1">Alert</span>
                                        <span className="text-yellow-300">News</span>
                                    </h1>
                                    <p className="text-xs md:text-sm text-red-100 font-medium">
                                        Stay Informed, Stay Alert
                                    </p>
                                </div>
                            </NavLink>
                        </div>

                        {/* Action Buttons - Right */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Search Toggle Button */}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="text-white hover:text-gray-100 hover:bg-red-700 p-1.5 sm:p-2 rounded-md transition-colors duration-200"
                                aria-label="Toggle search"
                            >
                                <FiSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>

                            {/* YouTube Button - Progressive visibility */}
                            <a 
                                href="https://www.youtube.com/@NationalAlertNews" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hidden sm:flex bg-red-700 hover:bg-red-800 text-white px-2 py-1.5 lg:px-3 lg:py-2 rounded text-xs lg:text-sm font-medium items-center space-x-1 transition-colors duration-200"
                            >
                                <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <span className="hidden md:inline lg:inline">YouTube</span>
                            </a>

                            {/* Submit News Button - Responsive text */}
                            <NavLink to="/crimeReportForm">
                                <button className="bg-white text-red-600 hover:bg-gray-50 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded font-bold text-xs sm:text-sm transition-all duration-200 hover:shadow-md cursor-pointer whitespace-nowrap">
                                    <span className="hidden sm:inline">Report Crime</span>
                                    <span className="sm:hidden">Report</span>
                                </button>
                            </NavLink>
                        </div>
                    </div>
                </Container>

                {/* Secondary Navbar - Fully Responsive */}
                <nav className="bg-black text-white py-1.5 sm:py-2 border-t border-red-500">
                    <Container>
                        <div className="flex space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto whitespace-nowrap px-2 sm:px-4 lg:px-6 scrollbar-hide">
                            {secondaryLinks.map((link, index) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => 
                                        `hover:text-gray-300 transition-colors duration-200 text-xs sm:text-sm lg:text-base py-1.5 sm:py-2 px-2 sm:px-3 lg:px-4 rounded-md flex-shrink-0 font-medium ${
                                            isActive 
                                                ? 'bg-red-600 text-white font-bold' 
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </Container>
                </nav>

                {/* Collapsible Search Bar */}
                {isSearchOpen && (
                    <div className="bg-white py-2 sm:py-3 shadow-sm border-b border-gray-100 animate-slideDown">
                        <Container>
                            <form onSubmit={handleSearchSubmit} className="max-w-sm sm:max-w-md lg:max-w-2xl mx-auto px-2 sm:px-4">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for news..."
                                        className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-2.5 lg:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 text-sm sm:text-base transition-all duration-200 placeholder-gray-400"
                                        aria-label="Search news"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 bg-red-600 text-white p-1.5 sm:p-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                                        aria-label="Submit search"
                                    >
                                        <FiSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                </div>
                            </form>
                        </Container>
                    </div>
                )}
            </header>

            {/* Enhanced Explore Side Menu - Fully Responsive */}
            <div
                className={`fixed top-0 right-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-full bg-white shadow-2xl transform ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
            >
                {/* Menu Header */}
                <div className="bg-red-600 text-white p-3 sm:p-4 lg:p-6 flex justify-between items-center">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold">Explore News</h2>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white hover:text-gray-200 p-1.5 sm:p-2 hover:bg-red-700 rounded-lg transition-colors duration-200"
                        aria-label="Close menu"
                    >
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </button>
                </div>

                {/* Menu Content */}
                <nav className="p-3 sm:p-4 lg:p-6">
                    <ul className="space-y-1 sm:space-y-2">
                        {secondaryLinks.map((link) => (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => 
                                        `block px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full text-sm sm:text-base lg:text-lg ${
                                            isActive ? 'bg-red-50 text-red-600 font-semibold border-l-4 border-red-600' : 'text-gray-700 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Additional menu items for mobile */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 sm:hidden">
                        <a 
                            href="https://www.youtube.com/@NationalAlertNews" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            <span>YouTube Channel</span>
                        </a>
                        <div className="px-3 py-2 text-xs text-gray-500">
                            {currentDate}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Overlay when menu is open */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Enhanced Custom CSS with Responsive Breakpoints */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                /* Custom breakpoints */
                @media (min-width: 375px) {
                    .xs\\:inline {
                        display: inline;
                    }
                    .xs\\:block {
                        display: block;
                    }
                    .xs\\:hidden {
                        display: none;
                    }
                }

                @media (max-width: 374px) {
                    .xs\\:hidden {
                        display: none;
                    }
                }

                /* Ultra small screens (< 375px) - Mobile First */
                @media (max-width: 374px) {
                    .mobile-brand {
                        max-width: 120px;
                    }
                    .mobile-brand h1 {
                        font-size: 0.65rem;
                        line-height: 0.8;
                    }
                    .mobile-logo {
                        height: 16px;
                        width: auto;
                    }
                }

                /* Small phones (375px - 479px) */
                @media (min-width: 375px) and (max-width: 479px) {
                    .mobile-brand h1 {
                        font-size: 0.75rem;
                    }
                }

                /* Medium phones (480px - 639px) */
                @media (min-width: 480px) and (max-width: 639px) {
                    .mobile-brand h1 {
                        font-size: 0.875rem;
                    }
                }

                /* Large phones (475px - 639px) */
                @media (min-width: 475px) and (max-width: 639px) {
                    .large-phone\\:px-3 {
                        padding-left: 0.75rem;
                        padding-right: 0.75rem;
                    }
                }

                /* Tablets (768px - 1023px) */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .tablet\\:text-lg {
                        font-size: 1.125rem;
                    }
                }

                /* Desktop (1024px+) */
                @media (min-width: 1024px) {
                    .desktop\\:space-x-6 > * + * {
                        margin-left: 1.5rem;
                    }
                }

                /* Slide down animation for search bar */
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }

                /* Additional responsive animations */
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: .5;
                    }
                }

                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                /* Gradient text animation */
                .gradient-text {
                    background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
                    background-size: 300% 300%;
                    animation: gradientShift 3s ease infinite;
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Responsive text scaling */
                @media (max-width: 320px) {
                    .brand-text {
                        font-size: 0.8rem;
                    }
                }

                @media (min-width: 321px) and (max-width: 480px) {
                    .brand-text {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </>
    );
}

export default Header;