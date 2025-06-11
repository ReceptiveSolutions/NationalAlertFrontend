import React from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Logo } from '../index';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

function Footer() {
    // Footer categories
    const categories = [
        { name: 'Sports', path: '/sports' },
        { name: 'Business', path: '/business' },
        { name: 'Technology', path: '/technology' },
        { name: 'Entertainment', path: '/entertainment' },
        { name:'Latest', path:'/latest'}
        // { name: 'Health', path: '/health' }
    ];
 
    return (
        
        <footer className="bg-black text-white">
            <Container className="pt-8">
                {/* Top Section - Logo, Submit Button, and Social */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    {/* Logo */}
                    <div className="mb-4 md:mb-0">
                        <Logo className="h-8 w-auto" />
                    </div>

                    {/* Submit Button - Centered */}
                    <NavLink to="/crimeReportForm">
                    <div className="my-4 md:my-0">
                        
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                            Report Crime
                        </button>
                       
                    </div>
                    </NavLink>

                    {/* Social Icons */}
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="https://www.facebook.com/people/National-Alert-News/61572374372039/?rdid=Yh0C5rQwo0KZ4Tww&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BRAGG4H5o%2F" className="text-gray-400 hover:text-white" aria-label="Facebook">
                            <FaFacebook size={24} />
                        </a>
                        <a href="https://x.com/Nationalalert4" className="text-gray-400 hover:text-white" aria-label="Twitter">
                            <FaTwitter size={24} />
                        </a>
                        <a href="https://www.instagram.com/nationalalertnews/?igsh=MXhlZXJxNnkwNWhldA%3D%3D#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                            <FaInstagram size={24} />
                        </a>
                        <a href="https://www.youtube.com/@NationalAlertNews" className="text-gray-400 hover:text-white" aria-label="YouTube">
                            <FaYoutube size={24} />
                        </a>
                        <a href="https://www.linkedin.com/company/national-alert-news/" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                            <FaLinkedin size={24} />
                        </a>
                       
                    </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-gray-800 my-6"></div>

                {/* Categories Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 text-red-500">Categories</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <NavLink
                                key={category.path}
                                to={category.path}
                                className={({ isActive }) => 
                                    `text-gray-400 hover:text-white ${isActive ? 'text-white font-medium' : ''}`
                                }
                            >
                                {category.name}
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} NatioanlAlert News. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <NavLink to="/terms" className="text-gray-500 hover:text-white text-sm">
                            Terms
                        </NavLink>
                        <NavLink to="/privacy" className="text-gray-500 hover:text-white text-sm">
                            Privacy
                        </NavLink>
                        <NavLink to="/contact" className="text-gray-500 hover:text-white text-sm">
                            Contact
                        </NavLink>
                       <NavLink to="/latest" className="text-gray-500 hover:text-white text-sm">
                            Latest
                        </NavLink>

                    </div>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;