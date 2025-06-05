import { Box } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';
import Pop from './Pop';

export default function Home() {
    return (
        <div
            className="w-full"
            style={{
                height: "100vh",
                backgroundImage: `url("https://img.freepik.com/free-vector/futuristic-binary-code-cyberspace-wallpaper-web-data-network_1017-54570.jpg?semt=ais_hybrid")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                overflow: "hidden",
            }}
        >
            <h1>2</h1>
            <Ho />
        </div>
    )
}

function Ho() {
    return (
        <Box p={3} mt={17} className="h-screen mt-0 flex flex-col">

            <div data-aos="fade-right" data-aos-duration="600" className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Text Section */}
                <div className="order-2 lg:order-1 p-4 lg:p-10 mt-8 lg:mt-16">
                    <h3 style={{ color: "white" }} className="text-4xl lg:text-6xl font-bold text-center lg:text-left">
                        #Surakshit Bharath
                    </h3>
                    <p style={{ lineHeight: "30px" }} className="mt-6 font-sans text-center text-xl text-white text-justify">
                        Join us in securing India's digital future and be a part of an ecosystem with a secure Android application, one click at a time
                    </p>
                    <div>
                        <Link to="/api">
                            <button style={{ background: "rgba(42, 161, 255, 1)" }} className='btn mt-8 p-3 rounded-xl font-bold text-white hover:scale-110 transition-transform duration-300'>
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
                <div
                    data-aos="fade-left"
                    data-aos-duration="1000"
                    className="order-1 lg:order-2 flex justify-center"
                >
                    <div className="w-full lg:w-4/5">
                        <img
                            src="https://preview.wpelemento.com/cyber-security/wp-content/uploads/sites/6/2024/06/slider-right-img.png"
                            alt="Floating Image"
                            className="animate-float w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto"
                        />

                    </div>
                </div>

            </div>
        </Box>
    );
}
