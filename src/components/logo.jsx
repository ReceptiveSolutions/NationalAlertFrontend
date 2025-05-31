import React from 'react'
import logo from '../assets/logo.png'
 function Logo({width = '120px', height = '120px', }) {
    return (
        <>
        <div>
            <img 
            src={logo}
            alt="Logo"
            style={{ width, height }} // fully
            />
        </div>
        </>
    )
}

export default Logo