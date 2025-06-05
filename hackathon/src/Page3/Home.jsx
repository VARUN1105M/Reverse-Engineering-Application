import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Carousel from "react-material-ui-carousel";
import Navbar from './Navbar';
import Login from '../Pages2/Login';
export default function Home() {
    return (
        <div
            className="w-full"
            style={{
                height: "100vh",
                backgroundImage: `url("https://img.freepik.com/free-vector/futuristic-binary-code-cyberspace-wallpaper-web-data-network_1017-54570.jpg?semt=ais_hybrid")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                overflow: "scroll",
            }}
        >
            <h1>2</h1>
            <div className='mt-4'>
                <Main />
            </div>
        </div>
    )
}

function Main() {
    return (
        <div>
            <div
                style={{ width: "100%" }}
                className="w-full flex flex-wrap lg:flex-nowrap"
            >
                <div className="relative flex justify-end w-full lg:w-1/2">
                    <img
                        src="https://preview.wpelemento.com/cyber-security/wp-content/uploads/sites/6/2024/06/slider-right-img.png"
                        alt=""
                        className="absolute object-cover"
                        style={{
                            height: "790px",
                            width: "100%",
                            maxWidth: "970px",
                            maxHeight: "770px",
                            marginRight: "200px"
                        }}
                    />
                </div>

                <Box
                    mt={20}
                    className="h-auto w-full lg:w-1/2 flex flex-col justify-center items-start p-4 lg:p-10"
                >
                    <div
                        style={{ width: "100%" }}
                        data-aos="fade-right"
                        data-aos-duration="600"
                        className="container mx-auto"
                    >
                        <div className="p-4 mt-4 lg:mt-16">
                            <h3 style={{ color: "white" }} className="text-4xl lg:text-6xl font-bold text-center lg:text-left">
                                #Surakshit Bharath
                            </h3>
                            <p style={{ lineHeight: "30px" }} className="mt-6 font-sans text-center text-xl text-white text-justify">
                                Join us in securing India's digital future and be a part of an ecosystem with a secure Android application, one click at a time
                            </p>
                        </div>
                    </div>
                    <div data-aos="fade-right"
                        data-aos-duration="600" className='mt-5'>
                        <Login />
                    </div>
                </Box>
            </div>

        </div>
    );
}

function Carosl() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "https://alanjoshua05.github.io/dani/Jothi.json"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return (
        <div className="mt-0">
            <Carousel>
                {data.carosal.map((item) => (
                    <Con key={item.id} item={item.imgs} />
                ))}
            </Carousel>
        </div>
    );
}

function Con(props) {
    return (
        <Box
            sx={{
                display: "flex",
                // justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: { xs: "8px" },

                height: { lg: "700px", md: "600px", sm: "500px", xs: "550px" },
            }}
        >
            <img
                src={props.item}
                width={"100%"}
                height={"100%"}
                style={{ objectFit: "cover", borderRadius: "15px" }}
            />
        </Box>
    );
}
