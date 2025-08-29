import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Logo } from '../index';
import { FiMenu, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [indiaDropdownOpen, setIndiaDropdownOpen] = useState(false);
    const [sidebarIndiaDropdownOpen, setSidebarIndiaDropdownOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, showAbove: false });
    const navigate = useNavigate();

    // Check if desktop on mount and resize
    React.useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 640);
        };
        
        checkDesktop(); // Check on mount
        window.addEventListener('resize', checkDesktop);
        
        return () => {
            window.removeEventListener('resize', checkDesktop);
        };
    }, []);

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

    // India cities - easily expandable
    const indiaCities = [
        { name: 'Mumbai', path: '/mumbai' },
        { name: 'Gujarat', path: '/gujrat' },
        // Add more cities here as needed
        // { name: 'Delhi', path: '/india/delhi' },
        // { name: 'Bangalore', path: '/india/bangalore' },
    ];

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        
        if (!trimmedQuery) return;

        // Set loading state
        setIsSearching(true);

        try {
            // Navigate to search results page
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            
            // Reset search state
            setSearchQuery('');
            setIsSearchOpen(false);
            
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        // Focus on search input when opening
        if (!isSearchOpen) {
            setTimeout(() => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.focus();
            }, 100);
        }
    };

    // Handle escape key to close search
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Close dropdowns when clicking outside
    const handleClickOutside = () => {
        setIndiaDropdownOpen(false);
    };

    // Handle India dropdown positioning with better viewport detection
    const updateDropdownPosition = () => {
        const button = document.getElementById('india-dropdown-button');
        if (button) {
            const rect = button.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const dropdownHeight = 200; // Estimated dropdown height
            const dropdownWidth = 180; // Estimated dropdown width
            
            // Check if dropdown would go below viewport
            const shouldShowAbove = rect.bottom + dropdownHeight > viewportHeight;
            
            // Calculate horizontal position to keep dropdown in viewport
            let leftPosition = rect.left;
            if (leftPosition + dropdownWidth > viewportWidth) {
                leftPosition = viewportWidth - dropdownWidth - 10; // 10px margin from edge
            }
            if (leftPosition < 10) {
                leftPosition = 10; // 10px margin from left edge
            }
            
            setDropdownPosition({
                top: shouldShowAbove 
                    ? rect.top - dropdownHeight - 5 // Position above button
                    : rect.bottom + 5, // Position below button
                left: leftPosition,
                showAbove: shouldShowAbove
            });
        }
    };

    const handleIndiaDropdownToggle = () => {
        // Only allow dropdown on desktop
        if (window.innerWidth < 640) return;
        
        if (!indiaDropdownOpen) {
            updateDropdownPosition();
        }
        setIndiaDropdownOpen(!indiaDropdownOpen);
    };

    // Handle India button click - different behavior for mobile vs desktop
    const handleIndiaClick = () => {
        if (window.innerWidth >= 640) {
            // Desktop: Toggle dropdown
            handleIndiaDropdownToggle();
        } else {
            // Mobile: Navigate to general India page or first city
            navigate('/india/mumbai'); // or navigate('/india') if you have a general India page
        }
    };

    // Update dropdown position on scroll and resize (desktop only)
    React.useEffect(() => {
        const handleScrollResize = () => {
            if (indiaDropdownOpen && window.innerWidth >= 640) { // Only for desktop
                updateDropdownPosition();
            }
        };

        if (indiaDropdownOpen && window.innerWidth >= 640) {
            window.addEventListener('scroll', handleScrollResize, { passive: true });
            window.addEventListener('resize', handleScrollResize);
            
            return () => {
                window.removeEventListener('scroll', handleScrollResize);
                window.removeEventListener('resize', handleScrollResize);
            };
        }
    }, [indiaDropdownOpen]);

    return (
        <>
            {/* Main Header - Updated to White Background */}
            <header className="bg-white text-black sticky top-0 z-50 shadow-lg border-b-2 border-red-600">
                <Container className="relative">
                    {/* Top Row - Fixed Mobile Layout to Prevent Overlap */}
                    <div className="flex items-center justify-between py-2 sm:py-3 px-2 sm:px-4 lg:px-6 gap-1 sm:gap-2">
                        
                        {/* Left Section - Explorer Button Only on Mobile */}
                        <div className="flex items-center flex-shrink-0">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:space-x-2 text-red-600 hover:text-white font-medium text-sm transition-all duration-300 hover:bg-red-600 sm:px-3 sm:py-2 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 cursor-pointer border border-red-600"
                                aria-label="Explore categories"
                            >
                                <FiMenu className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span className="hidden sm:inline">Explore</span>
                            </button>
                            
                            {/* Date - Only show on larger screens */}
                            <div className="hidden lg:flex bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium shadow-inner ml-3 text-gray-700">
                                <span className="hidden xl:inline">{currentDate}</span>
                                <span className="xl:hidden">
                                    {new Date().toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: '2-digit' 
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Center Section - Logo & Brand - Compressed for Mobile */}
                        <div className="flex items-center justify-center flex-1 min-w-0 px-1 sm:px-2">
                            <NavLink to="/" className="flex items-center group">
                                {/* Logo - Hidden on mobile, visible on sm+ */}
                                <div className="relative flex-shrink-0 mr-1 sm:mr-2 hidden sm:block">
                                    <Logo className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-lg" />
                                </div>
                                
                                {/* Brand Text - Compressed for mobile */}
                                <div className="text-center min-w-0">
                                    <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight tracking-wide">
                                        <span className="text-red-600 drop-shadow-md">The</span>
                                        <span className="text-black mx-0.5 sm:mx-1">Fact</span>
                                        <span className="text-red-600 drop-shadow-md">Bulletin</span>
                                    </h1>
                                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium tracking-wider hidden sm:block">
                                        Where Facts Speak Louder.
                                    </p>
                                </div>
                            </NavLink>
                        </div>

                        {/* Right Section - Compact Mobile Layout */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            {/* Search Toggle Button - Compact */}
                            <button
                                onClick={handleSearchToggle}
                                disabled={isSearching}
                                className={`flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto text-red-600 hover:text-white sm:p-2 rounded-lg transition-all duration-300 transform cursor-pointer border ${
                                    isSearchOpen ? 'bg-red-600 text-white border-red-600' : 'border-red-600 hover:bg-red-600'
                                } ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                aria-label="Toggle search"
                            >
                                {isSearching ? (
                                    <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                    <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                )}
                            </button>

                            {/* Submit News Button - Compact mobile version */}
                            <NavLink to="/crimeReportForm">
                                <button className="bg-red-600 text-white hover:bg-red-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer whitespace-nowrap">
                                    <span className="hidden sm:inline">Report Crime</span>
                                    <span className="sm:hidden">Report</span>
                                </button>
                            </NavLink>
                        </div>
                    </div>
                </Container>

                {/* Secondary Navbar - Updated to Black Background */}
                <nav className="bg-black text-white py-1.5 sm:py-2 border-t border-red-600 shadow-inner">
                    <Container>
                        <div className="flex space-x-1 sm:space-x-2 lg:space-x-6 overflow-x-auto px-2 sm:px-4 lg:px-6 scrollbar-hide">
                            {secondaryLinks.map((link, index) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => 
                                        `hover:text-red-400 transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 px-2 sm:px-4 lg:px-6 rounded-lg flex-shrink-0 font-medium transform hover:scale-105 ${
                                            isActive 
                                                ? 'bg-red-600 text-white font-bold shadow-lg' 
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            
                            {/* India Button - Conditional dropdown icon and behavior */}
                            <div className="relative flex-shrink-0">
                                <button
                                    onClick={handleIndiaClick}
                                    className="flex items-center space-x-1 hover:text-red-400 transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 px-2 sm:px-4 lg:px-6 rounded-lg font-medium transform hover:scale-105 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    id="india-dropdown-button"
                                >
                                    <span>India</span>
                                    {/* Show dropdown icon only on desktop (sm and above) */}
                                    <FiChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 hidden sm:inline-block ${indiaDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </Container>
                </nav>

                {/* Enhanced Collapsible Search Bar */}
                {isSearchOpen && (
                    <div className="bg-gradient-to-r from-gray-50 to-white py-4 shadow-lg border-b border-gray-200 animate-slideDown">
                        <Container>
                            <form onSubmit={handleSearchSubmit} className="max-w-md lg:max-w-2xl mx-auto px-3 sm:px-4">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        placeholder="Search for news articles..."
                                        className="search-input w-full pl-4 pr-12 py-3 lg:py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 text-base lg:text-lg transition-all duration-300 placeholder-gray-400 shadow-md focus:shadow-lg"
                                        aria-label="Search news articles"
                                        disabled={isSearching}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!searchQuery.trim() || isSearching}
                                        className="absolute right-2 bg-gradient-to-r from-red-600 to-red-700 text-white p-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        aria-label="Submit search"
                                    >
                                        {isSearching ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <FiSearch className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Search Tips */}
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">Enter</kbd> to search or <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">Esc</kbd> to close
                                </div>
                            </form>
                        </Container>
                    </div>
                )}
            </header>

            {/* India Cities Dropdown - Desktop Only with Fixed Positioning */}
            {indiaDropdownOpen && (
                <div 
                    className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-48 animate-slideDown overflow-hidden z-[99999] hidden sm:block ${
                        dropdownPosition.showAbove ? 'animate-slideUp' : 'animate-slideDown'
                    }`}
                    style={{ 
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="py-1">
                        {indiaCities.map((city, index) => (
                            <NavLink
                                key={city.path}
                                to={city.path}
                                onClick={() => setIndiaDropdownOpen(false)}
                                className={({ isActive }) => 
                                    `block px-4 py-3 text-sm font-medium transition-all duration-300 hover:translate-x-1 ${
                                        isActive 
                                            ? 'bg-red-600 text-white font-bold shadow-inner' 
                                            : 'text-gray-800 hover:bg-red-50 hover:text-red-600 hover:font-semibold'
                                    }`
                                }
                            >
                                {city.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Enhanced Explore Side Menu with Smooth Animations */}
            <div
                className={`fixed top-0 left-0 w-80 sm:w-96 max-w-[85vw] h-full bg-white shadow-2xl transform ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-all duration-500 ease-in-out z-50 overflow-y-auto sidebar-animate`}
            >
                {/* Menu Header - Updated to match new theme */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 flex justify-between items-center shadow-lg">
                    <h2 className="text-xl lg:text-2xl font-bold flex items-center animate-slideInLeft">
                        <FiMenu className="mr-2" />
                        Explore News
                    </h2>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center w-10 h-10 text-white hover:text-red-200 hover:bg-red-800 hover:bg-opacity-70 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                        aria-label="Close menu"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Menu Content with Staggered Animation */}
                <nav className="p-5">
                    <ul className="space-y-2">
                        {secondaryLinks.map((link, index) => (
                            <li key={link.path} className="animate-slideInLeft" style={{ animationDelay: `${index * 0.1}s` }}>
                                <NavLink
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => 
                                        `block px-4 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 w-full text-base font-medium transform hover:scale-102 hover:translate-x-2 ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-bold border-l-4 border-red-600 shadow-md' 
                                                : 'text-gray-700 hover:text-gray-900 hover:shadow-sm'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                        
                        {/* India Section in Sidebar */}
                        <li className="animate-slideInLeft" style={{ animationDelay: `${secondaryLinks.length * 0.1}s` }}>
                            <div>
                                <button
                                    onClick={() => setSidebarIndiaDropdownOpen(!sidebarIndiaDropdownOpen)}
                                    className={`flex items-center justify-between w-full px-4 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 text-base font-medium transform hover:scale-102 hover:translate-x-2 text-gray-700 hover:text-gray-900 hover:shadow-sm ${
                                        sidebarIndiaDropdownOpen ? 'bg-gray-50' : ''
                                    }`}
                                >
                                    <span>India</span>
                                    <FiChevronDown className={`h-4 w-4 transition-transform duration-300 ${sidebarIndiaDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {/* India Cities in Sidebar */}
                                {sidebarIndiaDropdownOpen && (
                                    <div className="ml-4 mt-2 space-y-1 animate-slideDown">
                                        {indiaCities.map((city, cityIndex) => (
                                            <NavLink
                                                key={city.path}
                                                to={city.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) => 
                                                    `block px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium transform hover:translate-x-2 ${
                                                        isActive 
                                                            ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-bold border-l-3 border-red-600' 
                                                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                                    }`
                                                }
                                            >
                                                {city.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </li>
                    </ul>

                    {/* Mobile-only additional items with Animation */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                        <div className="animate-slideInLeft" style={{ animationDelay: '0.8s' }}>
                            <a 
                                href="https://www.youtube.com/@NationalAlertNews" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-sm hover:translate-x-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <span className="font-medium">YouTube Channel</span>
                            </a>
                        </div>
                        
                        <div className="animate-slideInLeft" style={{ animationDelay: '0.9s' }}>
                            <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 rounded-xl">
                                <div className="font-medium text-gray-700 mb-1">Today</div>
                                <div className="text-xs">{currentDate}</div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Enhanced Overlay with Smooth Fade Animation */}
            {(isMenuOpen || indiaDropdownOpen) && (
                <div
                    className="fixed inset-0 z-40 transition-all duration-500 animate-fadeIn"
                    style={{ backgroundColor: indiaDropdownOpen ? 'transparent' : 'rgba(0, 0, 0, 0.6)', backdropFilter: isMenuOpen ? 'blur(4px)' : 'none' }}
                    onClick={() => {
                        setIsMenuOpen(false);
                        setIndiaDropdownOpen(false);
                    }}
                />
            )}

            {/* Enhanced Custom CSS with Smooth Animations */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                /* Smooth sidebar animation */
                .sidebar-animate {
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Smooth animations */
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }

                .animate-slideInLeft {
                    animation: slideInLeft 0.4s ease-out forwards;
                    opacity: 0;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                /* Backdrop blur support */
                .backdrop-blur-sm {
                    backdrop-filter: blur(4px);
                }

                /* Enhanced shadow effects */
                .shadow-inner {
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
                }

                /* Mobile-optimized button sizing */
                @media (max-width: 640px) {
                    .mobile-button {
                        min-height: 44px;
                        min-width: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }

                /* Prevent horizontal scroll on very small screens */
                @media (max-width: 320px) {
                    .container {
                        padding-left: 8px;
                        padding-right: 8px;
                    }
                }

                /* Enhanced responsive breakpoints */
                @media (min-width: 640px) and (max-width: 768px) {
                    .tablet-optimized {
                        font-size: 1rem;
                    }
                }

                /* Remove mobile dropdown styles since dropdown is desktop-only now */
                @media (max-width: 640px) {
                    /* Prevent overlap on small screens */
                    .mobile-header {
                        min-height: 60px;
                    }
                    
                    /* Ensure buttons don't overlap */
                    .mobile-button-group {
                        gap: 0.25rem;
                    }
                    
                    /* Compact mobile layout */
                    .mobile-compact {
                        padding: 0.5rem 0.5rem;
                    }
                    
                    /* Better touch targets */
                    button, a {
                        min-height: 36px;
                        min-width: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    /* Prevent text wrapping issues */
                    .text-nowrap {
                        white-space: nowrap;
                    }
                    
                    /* Fix for very small screens */
                    @media (max-width: 375px) {
                        .container {
                            padding-left: 4px;
                            padding-right: 4px;
                        }
                        
                        .mobile-spacing {
                            gap: 0.125rem;
                        }
                        
                        button, a {
                            min-height: 32px;
                            min-width: 32px;
                        }
                        
                        /* Smaller icons on very small screens */
                        .icon-small {
                            height: 14px;
                            width: 14px;
                        }
                    }
                }

                /* Smooth transitions for all interactive elements */
                * {
                    transition-property: transform, box-shadow, background-color, border-color, color, opacity;
                    transition-duration: 0.3s;
                    transition-timing-function: ease-in-out;
                }

                /* Icon centering fix */
                .icon-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Prevent body scroll when sidebar is open */
                body.sidebar-open {
                    overflow: hidden;
                }

                /* Enhanced sidebar entrance animation */
                @media (prefers-reduced-motion: no-preference) {
                    .sidebar-animate {
                        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                }
            `}</style>
        </>
    );
}

export default Header;