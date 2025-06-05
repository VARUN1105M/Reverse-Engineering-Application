import { Box } from '@mui/material';
import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
AOS.init();
import hero from './hero.svg'

export default function Home() {
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(242, 242, 242, 1)", overflow: "hidden" }}>
            <div style={{ height: "200px" }}>
                <svg
                    style={{ position: "absolute" }}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                >
                    <path
                        fill="#7928F5"
                        fill-opacity="1"
                        d="M0,256L30,229.3C60,203,120,149,180,117.3C240,85,300,75,360,69.3C420,64,480,64,540,80C600,96,660,128,720,122.7C780,117,840,75,900,85.3C960,96,1020,160,1080,160C1140,160,1200,96,1260,101.3C1320,107,1380,181,1410,218.7L1440,256L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"
                    ></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path
                        fill="#D3C2EE"
                        fill-opacity="1"
                        d="M0,160L30,170.7C60,181,120,203,180,208C240,213,300,203,360,197.3C420,192,480,192,540,165.3C600,139,660,85,720,101.3C780,117,840,203,900,197.3C960,192,1020,96,1080,74.7C1140,53,1200,107,1260,128C1320,149,1380,139,1410,133.3L1440,128L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"
                    ></path>
                </svg>
            </div>
            <Box mt={0} flexGrow={1} display="flex" justifyContent="center" alignItems="center">
                <Main />
            </Box>
        </div>
    );
}

function Main() {
    return (
        <Box className="h-screen mt-0 flex flex-col">
            <div data-aos="fade-right" data-aos-duration="600" className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Text Section */}
                <div className="order-2 lg:order-1 p-4 lg:p-10 mt-4 lg:mt-16">
                    <h3 style={{color:"#390A80"}} className="text-4xl lg:text-5xl font-bold text-center lg:text-left">
                        App Modifier
                    </h3>
                    <p className="mt-4 font-sans text-center lg:text-justify text-base">
                        Bring your documents to life with an exciting, comic-style makeover. Whether it's a dull report, an in-depth guide, or a technical paper, turn it into a visually captivating experience that’s easy to read and fun to explore. Say goodbye to boring PDFs and hello to interactive storytelling!
                    </p>
                    <Link to="/api">
                    <button style={{background:"#7928F5"}} className='btn mt-8 p-3 rounded-xl font-bold text-white hover:scale-110 transition-transform duration-300'>
                        Get Started
                    </button></Link>

                </div>
                {/* Spline Section */}
                <div data-aos="fade-left" data-aos-duration="1000" className="order-1 lg:order-2 flex justify-center">
                    <div className="w-full lg:w-4/5">
                    {/* <Spline scene="https://prod.spline.design/KwIfoD0nl4PMbizi/scene.splinecode" /> */}
                    <img src={hero} alt="" />
                    </div>
                </div>
            </div>
        </Box>
    );
}
