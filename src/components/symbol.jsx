import React from 'react'
import logo from '../assets/Logo.png'
 function symbol({width = '120px', height = '120px', }) {
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

export default symbol