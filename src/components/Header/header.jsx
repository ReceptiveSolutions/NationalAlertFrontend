import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Logo } from '../index';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Current date formatting
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Secondary nav links - moved to top level since we're using them in both places
    const secondaryLinks = [
        { name: 'Home', path: '/' },
        { name: 'Sports', path: '/sports' },
        { name: 'Business', path: '/business' },
        { name: 'Entertainment', path: '/entertainment' },
        // { name: 'Health', path: '/health' },
        { name:'Latest', path:'/latest'},
        // {name : 'IndianSports', path:'/IndianSportsHomepage'}
    ];

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    return (
        <>
            {/* Main Header */}
            <header className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
                <Container className="relative">
                    {/* Top Row */}
                    <div className="flex items-center justify-between py-4 px-2 sm:px-4">
                        {/* Explorer Button - Top Left */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="flex items-center space-x-2 text-white hover:text-gray-100 font-medium text-sm sm:text-base transition-colors duration-200 cursor-pointer hover:bg-red-700 px-3 py-2 rounded-lg"
                            aria-label="Explore categories"
                        >
                            <FiMenu className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden xs:inline">Explore</span>
                        </button>

                        {/* Logo - Center */}
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <NavLink to="/" className="block">
                                <Logo className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 transition-all duration-200 hover:scale-105" />
                            </NavLink>
                        </div>

                        {/* Submit News Button - Top Right */}
                        <NavLink to="/crimeReportForm">
                            <button className="bg-white text-red-600 hover:bg-gray-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-md cursor-pointer">
                                <span className="hidden sm:inline">Report Crime</span>
                                <span className="sm:hidden">Submit</span>
                            </button>
                        </NavLink>
                    </div>

                    {/* Date - Hidden on mobile, shown on larger screens */}
                    <div className="hidden sm:block pb-3 text-xs sm:text-sm px-2 sm:px-4">
                        <div className="bg-red-700 px-3 py-1 rounded-md inline-block">
                            <span>{currentDate}</span>
                        </div>
                    </div>
                </Container>

                {/* Secondary Navbar */}
                <nav className="bg-black text-white sticky top-0 z-40 py-2 border-t border-red-500">
                    <Container>
                        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto whitespace-nowrap px-2 sm:px-4 scrollbar-hide">
                            {secondaryLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => 
                                        `hover:text-gray-300 transition-colors duration-200 text-sm sm:text-base py-2 px-3 sm:px-4 rounded-md flex-shrink-0 ${
                                            isActive ? 'bg-red-600 text-white font-semibold' : 'text-gray-300 hover:bg-gray-800'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </Container>
                </nav>
            </header>

            {/* Explore Side Menu */}
            <div
                className={`fixed top-0 right-0 w-full sm:w-80 md:w-96 h-full bg-white shadow-xl transform ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
            >
                {/* Menu Header */}
                <div className="bg-red-600 text-white p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold">Explore News</h2>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white hover:text-gray-200 p-2 hover:bg-red-700 rounded-lg transition-all duration-200"
                        aria-label="Close menu"
                    >
                        <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                {/* Menu Content */}
                <nav className="p-4 sm:p-6">
                    <ul className="space-y-2">
                        {secondaryLinks.map((link) => (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => 
                                        `block px-4 py-3 sm:py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 w-full text-sm sm:text-base ${
                                            isActive ? 'bg-red-50 text-red-600 font-semibold border-l-4 border-red-600' : 'text-gray-700 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Overlay when menu is open */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Custom CSS for hiding scrollbar */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                /* Custom breakpoint for extra small screens */
                @media (min-width: 475px) {
                    .xs\\:inline {
                        display: inline;
                    }
                }
            `}</style>
        </>
    );
}

export default Header;