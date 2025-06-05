import React, { useEffect, useState } from "react";
import "./file.css";
import { Box } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import Avatar from '@mui/material/Avatar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from "react-router-dom";
import PermDeviceInformationIcon from '@mui/icons-material/PermDeviceInformation';
import AndroidIcon from '@mui/icons-material/Android';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

AOS.init();

const per = [
    {
        title: "Disable Camera Permissions",
        description: "Remove camera permissions if the app does not require camera access.",
    },
    {
        title: "Disable Microphone Permissions",
        description: "If the app does not require microphone access, you can remove the microphone permissions.",
    },
    {
        title: "Disable Screenshot Permissions",
        description: "If the app does not require screenshot access, you can remove the microphone permissions.",
    },
    {
        title: "Disable Location Permissions",
        description: "If the app does not need to access the user's location, you can remove these permissions to prevent tracking.",
    },
    {
        title: "Disable External Storage Access",
        description: "If the app does not need to access external storage, remove permissions related to storage access.",
    },
    {
        title: "Disable Network Permissions",
        description: "If the app does not require internet or network access, remove the related permissions.",
    },
    {
        title: "Disable Bluetooth Permissions",
        description: "If the app does not interact with Bluetooth, you can disable Bluetooth permissions.",
    },
    {
        title: "Disable SMS Permissions",
        description: "If the app does not send or receive SMS messages, remove the SMS-related permissions.",
    },
    {
        title: "Disable Overlay Permissions",
        description: "If the app does not need overlay capabilities (which can be a security risk), you can remove the following permission.",
    },
    {
        title: "Disable Accessibility Features",
        description: "If the app does not use any accessibility features, disable them to prevent misuse or unwanted access to app data.",
    },
];

const FileUploader = () => {
    const [apkFile, setApkFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [download, setDownload] = useState(false);
    const [permissions, setPermissions] = useState([])
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false)
    const [manual, setManual] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleToggle = (title) => {
        setSelectedOptions((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    // Slider settings
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024, // Large devices
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 600, // Small devices
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Group permissions into chunks of 6
    const chunks = [];
    for (let i = 0; i < per.length; i += 6) {
        chunks.push(per.slice(i, i + 6));
    }

    const handleApply = async () => {
        const payload = {
            selectedPermissions: selectedOptions,
            toggleStatus: manual,
        };

        console.log("Sending to backend:", payload);

        try {
            const response = await fetch("http://127.0.0.1:4500/toggle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Permissions updated successfully!", data);

                // Store the download link from the response
                if (data.downloadLink) {
                    setDownloadLink(data.downloadLink);
                } else {
                    console.error("Download link not provided in the response.");
                }
            } else {
                console.error("Failed to update permissions");
            }
        } catch (error) {
            console.error("Error sending data to backend:", error);
        }
        handleUploadClick();
    };

    useEffect(() => {
        if (uploaded) {
            setDownload(true);
        }
    }, [uploaded]);

    const handleUploadClick = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setUploaded(true);
        }, 5000);
    };


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setApkFile(file);
            setProgress(50); // Update progress to 100% on file selection
            setLoading(true)

            const formData = new FormData();
            formData.append("apkfile", file);

            setProgress(75);
            try {
                const response = await fetch("http://127.0.0.1:4500/upload", {
                    method: "POST",
                    body: formData,
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("Response from server:", data);
                    setProgress(75);

                    // Assuming `data.permissions` contains the permissions array
                    if (data.permissions) {
                        setPermissions(data.permissions);
                        setProgress(100);

                    } else {
                        console.warn("Permissions data not found in the server response");
                    }
                } else {
                    const errorData = await response.json();
                    console.error("Error from server:", errorData);
                    alert(errorData.error || "An error occurred during the upload.");
                }
            } catch (error) {
                console.error("Network error:", error);
                alert("Failed to connect to the server.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch('http://127.0.0.1:4500/download', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to download the APK');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element for the download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Modified_apk.apk'; // Friendly name for the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('APK downloaded successfully');
        } catch (error) {
            console.error('Error during APK download:', error);
        }
    };

    function handleManual(e) {
        setManual(e.target.checked);
    }

    return (
        <div style={{
            height: "100vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "scroll",
            background: "rgba(2, 18, 33, 1)",
        }}>
            <div className="flex" style={{ width: "100%" }}>
                <Sidebar />
                <div style={{ width: "100%", overflow: "scroll", height: "100vh" }}>
                    <Box className="flex" p={6} sx={{ width: "100%", height: "" }}>
                        <div style={{ width: "100%", height: "" }} className="flex gap-6">

                            <div style={{ width: "100%" }} className="p-0">
                                <div className="flex justify-center items-center" style={{ display: progress === 100 && "none", height: "75vh" }}>
                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        <div className="input-div">
                                            <input className="input" name="file" type="file" accept=".apk" onChange={handleFileChange} />
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor" className="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                                        </div>
                                        <p className="font-sans mt-10 font-bold text-3xl text-white">Upload the APK</p>
                                        <CircularProgress sx={{ mt: 5, display: loading ? "flex" : "none" }} />

                                    </div>
                                </div>
                                {permissions.length > 0 && (
                                    <div
                                        style={{
                                            borderRadius: "15px",
                                            animation: "crackerEffect 1s ease-in-out",
                                            height: "45vh",
                                            overflow: "auto", // Use 'auto' for better responsiveness
                                            boxShadow:
                                                "0 2px 40px -5px rgba(42, 89, 126, 1), 0 2px 6px -4px rgba(41, 161, 253, 1)",
                                            background: "rgba(2, 18, 33, 1)",
                                        }}
                                        className="flex flex-col mt-5 justify-center items-center border border-gray-700 p-5 md:p-4 lg:p-8"
                                    >
                                        <div
                                            className="p-5 shadow-lg w-full"
                                            style={{
                                                overflow: "auto", // Keep scrollable behavior
                                            }}
                                        >
                                            <p
                                                id="title"
                                                className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center"
                                            >
                                                Existing Permissions{" "}
                                                <AndroidIcon
                                                    sx={{
                                                        color: "rgba(51, 189, 46, 1)",
                                                        fontSize: { xs: 24, md: 30, lg: 35 },
                                                        marginLeft: "0.5rem",
                                                    }}
                                                />
                                            </p>
                                            <hr className="my-4 border-gray-600" />
                                            <ul
                                                className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                            >
                                                {permissions.map((item, index) => (
                                                    <li
                                                        className="mt-1 flex items-center bg-gray-800 p-2 rounded-md shadow-md"
                                                        key={index}
                                                    >
                                                        <PermDeviceInformationIcon className="mr-2 text-green-400" />
                                                        <p className="text-white text-sm md:text-base break-words overflow-hidden text-ellipsis">
                                                            {item}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </Box>
                    {progress === 100 && (
                        <Box mt={45} data-aos="zoom-in-left" sx={{ width: "100%" }} className=" shadow-lg p-8">
                            <div style={{ borderRadius: "15px" }} className="p-5">
                                <div className="flex justify-center items-center">
                                    <div className="voltage-button mt-8">
                                        {uploaded ? (
                                            manual ? (
                                                <div>
                                                    <div class="flex items-center p-4 mb-4 text-white border border-blue-800 rounded-lg bg-gray-800 " role="alert">
                                                        <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                                        </svg>
                                                        <span class="sr-only">Info</span>
                                                        <div>
                                                            <span style={{fontWeight:800}} class="font-medium">Info alert!</span> The requirements has been uploaded sucessfully, you'll get your modified apk in 2 working days.
                                                        </div>
                                                    </div>
                                                </div>

                                            ) : (
                                                <button onClick={handleDownload}>Download APK</button>
                                            )
                                        ) : (
                                            <button onClick={handleOpen}>Add Security</button>
                                        )}

                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 234.6 61.3" preserveAspectRatio="none" xmlSpace="preserve">

                                            <filter id="glow">
                                                <feGaussianBlur className="blur" result="coloredBlur" stdDeviation="2"></feGaussianBlur>
                                                <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" seed="3" />
                                                <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" xChannelSelector="R" yChannelSelector="G" result="displace"></feDisplacementMap>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"></feMergeNode>
                                                    <feMergeNode in="coloredBlur"></feMergeNode>
                                                    <feMergeNode in="coloredBlur"></feMergeNode>
                                                    <feMergeNode in="displace"></feMergeNode>
                                                    <feMergeNode in="SourceGraphic"></feMergeNode>
                                                </feMerge>
                                            </filter>
                                            <path className="voltage line-1" d="m216.3 51.2c-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 6.8-7.3 6.8-3.7 0-3.7-4.6-7.3-4.6-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-0.9-7.3-0.9-3.7 0-3.7-2.7-7.3-2.7-3.7 0-3.7 7.8-7.3 7.8-3.7 0-3.7-4.9-7.3-4.9-3.7 0-3.7-7.8-7.3-7.8-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 3.1-7.3 3.1-3.7 0-3.7 10.9-7.3 10.9-3.7 0-3.7-12.5-7.3-12.5-3.7 0-3.7 4.6-7.3 4.6-3.7 0-3.7 4.5-7.3 4.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-10-7.3-10-3.7 0-3.7-0.4-7.3-0.4-3.7 0-3.7 2.3-7.3 2.3-3.7 0-3.7 7.1-7.3 7.1-3.7 0-3.7-11.2-7.3-11.2-3.7 0-3.7 3.5-7.3 3.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-2.9-7.3-2.9-3.7 0-3.7 8.4-7.3 8.4-3.7 0-3.7-14.6-7.3-14.6-3.7 0-3.7 5.8-7.3 5.8-2.2 0-3.8-0.4-5.5-1.5-1.8-1.1-1.8-2.9-2.9-4.8-1-1.8 1.9-2.7 1.9-4.8 0-3.4-2.1-3.4-2.1-6.8s-9.9-3.4-9.9-6.8 8-3.4 8-6.8c0-2.2 2.1-2.4 3.1-4.2 1.1-1.8 0.2-3.9 2-5 1.8-1 3.1-7.9 5.3-7.9 3.7 0 3.7 0.9 7.3 0.9 3.7 0 3.7 6.7 7.3 6.7 3.7 0 3.7-1.8 7.3-1.8 3.7 0 3.7-0.6 7.3-0.6 3.7 0 3.7-7.8 7.3-7.8h7.3c3.7 0 3.7 4.7 7.3 4.7 3.7 0 3.7-1.1 7.3-1.1 3.7 0 3.7 11.6 7.3 11.6 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-12.9 7.3-12.9 3.7 0 3.7 10.9 7.3 10.9 3.7 0 3.7 1.3 7.3 1.3 3.7 0 3.7-8.7 7.3-8.7 3.7 0 3.7 11.5 7.3 11.5 3.7 0 3.7-1.4 7.3-1.4 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-5.8 7.3-5.8 3.7 0 3.7-1.3 7.3-1.3 3.7 0 3.7 6.6 7.3 6.6s3.7-9.3 7.3-9.3c3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7 8.5 7.3 8.5 3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7-1.5 7.3-1.5 3.7 0 3.7 1.6 7.3 1.6s3.7-5.1 7.3-5.1c2.2 0 0.6 9.6 2.4 10.7s4.1-2 5.1-0.1c1 1.8 10.3 2.2 10.3 4.3 0 3.4-10.7 3.4-10.7 6.8s1.2 3.4 1.2 6.8 1.9 3.4 1.9 6.8c0 2.2 7.2 7.7 6.2 9.5-1.1 1.8-12.3-6.5-14.1-5.5-1.7 0.9-0.1 6.2-2.2 6.2z" fill="transparent" stroke="#fff"></path>
                                            <path className="voltage line-2" d="m216.3 52.1c-3 0-3-0.5-6-0.5s-3 3-6 3-3-2-6-2-3 1.6-6 1.6-3-0.4-6-0.4-3-1.2-6-1.2-3 3.4-6 3.4-3-2.2-6-2.2-3-3.4-6-3.4-3-0.5-6-0.5-3 1.4-6 1.4-3 4.8-6 4.8-3-5.5-6-5.5-3 2-6 2-3 2-6 2-3 1.6-6 1.6-3-4.4-6-4.4-3-0.2-6-0.2-3 1-6 1-3 3.1-6 3.1-3-4.9-6-4.9-3 1.5-6 1.5-3 1.6-6 1.6-3-1.3-6-1.3-3 3.7-6 3.7-3-6.4-6-6.4-3 2.5-6 2.5h-6c-3 0-3-0.6-6-0.6s-3-1.4-6-1.4-3 0.9-6 0.9-3 4.3-6 4.3-3-3.5-6-3.5c-2.2 0-3.4-1.3-5.2-2.3-1.8-1.1-3.6-1.5-4.6-3.3s-4.4-3.5-4.4-5.7c0-3.4 0.4-3.4 0.4-6.8s2.9-3.4 2.9-6.8-0.8-3.4-0.8-6.8c0-2.2 0.3-4.2 1.3-5.9 1.1-1.8 0.8-6.2 2.6-7.3 1.8-1 5.5-2 7.7-2 3 0 3 2 6 2s3-0.5 6-0.5 3 5.1 6 5.1 3-1.1 6-1.1 3-5.6 6-5.6 3 4.8 6 4.8 3 0.6 6 0.6 3-3.8 6-3.8 3 5.1 6 5.1 3-0.6 6-0.6 3-1.2 6-1.2 3-2.6 6-2.6 3-0.6 6-0.6 3 2.9 6 2.9 3-4.1 6-4.1 3 0.1 6 0.1 3 3.7 6 3.7 3 0.1 6 0.1 3-0.6 6-0.6 3 0.7 6 0.7 3-2.2 6-2.2 3 4.4 6 4.4 3-1.7 6-1.7 3-4 6-4 3 4.7 6 4.7 3-0.5 6-0.5 3-0.8 6-0.8 3-3.8 6-3.8 3 6.3 6 6.3 3-4.8 6-4.8 3 1.9 6 1.9 3-1.9 6-1.9 3 1.3 6 1.3c2.2 0 5-0.5 6.7 0.5 1.8 1.1 2.4 4 3.5 5.8 1 1.8 0.3 3.7 0.3 5.9 0 3.4 3.4 3.4 3.4 6.8s-3.3 3.4-3.3 6.8 4 3.4 4 6.8c0 2.2-6 2.7-7 4.4-1.1 1.8 1.1 6.7-0.7 7.7-1.6 0.8-4.7-1.1-6.8-1.1z" fill="transparent" stroke="#fff"></path>
                                        </svg>
                                        <div className="dots">
                                            <div className="dot dot-1"></div>
                                            <div className="dot dot-2"></div>
                                            <div className="dot dot-3"></div>
                                            <div className="dot dot-4"></div>
                                            <div className="dot dot-5"></div>
                                        </div>
                                    </div>
                                </div>

                                <Modal
                                    aria-labelledby="unstyled-modal-title"
                                    aria-describedby="unstyled-modal-description"
                                    open={open}
                                    onClose={handleClose}
                                    slots={{ backdrop: StyledBackdrop }}
                                    sx={{ p: 2 }}
                                >
                                    <Box
                                        className="flex justify-center items-center border shadow-lg border-gray-700"
                                        sx={{
                                            backdropFilter: "blur(8px)",
                                            background: "rgba(2, 18, 33, 0.4)",
                                            borderRadius: "15px",
                                        }}
                                    >
                                        <div
                                            className="p-4 md:p-8 w-full"
                                            style={{ maxWidth: "80vw", maxHeight: "80vh", overflowY: "auto" }}
                                        >
                                            <Box p={4} ml={0}>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-sans font-bold text-2xl md:text-4xl text-white">
                                                        Toggle Options
                                                    </p>
                                                    <div className="checkbox-wrapper-35 mt-2 relative">
                                                        <input
                                                            value="private"
                                                            name="switch"
                                                            id="switch"
                                                            type="checkbox"
                                                            className="switch"
                                                            checked={manual}
                                                            onChange={handleManual}
                                                        />
                                                        <label htmlFor="switch">
                                                            <span className="switch-x-text">This is </span>
                                                            <span className="switch-x-toggletext">
                                                                <span className="switch-x-unchecked">
                                                                    <span className="switch-x-hiddenlabel">Unchecked: </span>Automatic
                                                                </span>
                                                                <span className="switch-x-checked">
                                                                    <span className="switch-x-hiddenlabel">Checked: </span>Manual
                                                                </span>
                                                            </span>
                                                        </label>

                                                    </div>
                                                </div>

                                                <hr
                                                    className="my-4 md:my-7"
                                                    style={{ color: "black", background: "black" }}
                                                />
                                                <Box display={{ xs: "none", lg: "block" }}>
                                                    <Slider {...settings}>
                                                        {chunks.map((chunk, pageIndex) => (
                                                            <div className="p-6" key={pageIndex}>
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                    {chunk.map((permission, index) => (
                                                                        <div key={index} className="mb-2 flex gap-4">
                                                                            <label className="switch">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedOptions.includes(permission.title)}
                                                                                    onChange={() => handleToggle(permission.title)}
                                                                                />
                                                                                <span className="slider"></span>
                                                                            </label>
                                                                            <div>
                                                                                <p className="text-white text-sm md:text-xl font-bold">
                                                                                    {permission.title}
                                                                                </p>
                                                                                <p className="text-white text-xs md:text-sm font-thin">
                                                                                    {permission.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </Slider>
                                                </Box>

                                                {/* For mobile screens: Display a scrollable list */}
                                                <Box display={{ lg: "none" }}>
                                                    <div
                                                        className="grid grid-cols-1 gap-4"
                                                        style={{ overflow: "auto", maxHeight: "50vh" }}
                                                    >
                                                        {per.map((permission, index) => (
                                                            <div key={index} className="mb-2 flex gap-4">
                                                                <label className="switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedOptions.includes(permission.title)}
                                                                        onChange={() => handleToggle(permission.title)}
                                                                    />
                                                                    <span className="slider"></span>
                                                                </label>
                                                                <div>
                                                                    <p className="text-white text-sm md:text-xl font-bold">
                                                                        {permission.title}
                                                                    </p>
                                                                    <p className="text-white text-xs md:text-sm font-thin">
                                                                        {permission.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Box>
                                                <Box mt={4} sx={{ float: "right" }}>
                                                    <div className="flex">
                                                        {!uploaded && (
                                                            <button
                                                                id="button"
                                                                className="px-4 py-2 text-sm md:text-base"
                                                                //onClick={handleUploadClick}
                                                                onClick={handleApply}
                                                                disabled={uploading}
                                                            >
                                                                {uploading ? "Uploading..." : "Upload"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </Box>
                                            </Box>
                                        </div>
                                    </Box>
                                </Modal>
                            </div>
                        </Box>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false); // Sidebar open state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile navbar state

    return (
        <>
            {/* Sidebar for larger screens */}
            <div
                style={{
                    background: "rgba(42, 89, 126, 1)",
                    borderTopRightRadius: "15px",
                    borderBottomRightRadius: "15px",
                }}
                className={`hidden lg:flex flex-col ${isOpen ? "w-64" : "w-20"
                    } transition-width duration-300 h-screen p-5 pt-8 shadow-lg bg-gray-800 border border-gray-700`}
            >
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white text-3xl mb-5 focus:outline-none"
                        >
                            ☰
                        </button>
                        <ul className="space-y-4 mt-4" style={{ width: "100%" }}>
                            <li className="hover:bg-cyan-700 p-3 rounded-lg">
                                <Link
                                    to="/"
                                    style={{ width: "100%" }}
                                    className="flex items-center text-white text-lg font-medium"
                                >
                                    <span
                                        className={`material-icons ${isOpen ? "mr-3" : ""}`}
                                        style={{
                                            display: isOpen ? "none" : "flex",
                                        }}
                                    >
                                        <HomeIcon />
                                    </span>
                                    {isOpen && (
                                        <span className="flex gap-5">
                                            <HomeIcon />
                                            <p>Home</p>
                                        </span>
                                    )}
                                </Link>

                            </li>
                            <li className="hover:bg-cyan-700 p-3 rounded-lg">
                                <a
                                    href="#"
                                    className="flex items-center text-white text-lg font-medium"
                                >
                                    <span
                                        className={`material-icons ${isOpen ? "mr-3" : ""
                                            }`}
                                        style={{
                                            display: isOpen
                                                ? "none"
                                                : "flex",
                                        }}
                                    >
                                        <InfoIcon />
                                    </span>
                                    {isOpen && (
                                        <span className="flex gap-5">
                                            <InfoIcon /> About
                                        </span>
                                    )}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <a
                            href="#"
                            className="flex items-center text-white text-lg font-medium"
                        >
                            <span
                                className={`material-icons ${isOpen ? "mr-3" : ""
                                    }`}
                                style={{
                                    display: isOpen ? "none" : "flex",
                                }}
                            >
                                <Avatar
                                    alt="Remy Sharp"
                                    src="https://i1.sndcdn.com/avatars-000638476566-vbdo7x-t500x500.jpg"
                                />
                            </span>
                            {isOpen && (
                                <span className="flex gap-5">
                                    <Avatar
                                        alt="Remy Sharp"
                                        src="https://i1.sndcdn.com/avatars-000638476566-vbdo7x-t500x500.jpg"
                                    />
                                    <p className="mt-2">Account</p>
                                </span>
                            )}
                        </a>
                    </div>
                </div>
            </div>

            {/* Navbar for smaller screens */}
            <div style={{ height: "50px", position: "absolute", borderRadius: "5px" }} className="lg:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-2xl focus:outline-none"
                >
                    ☰
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div
                    style={{
                        background: "rgba(42, 89, 126, 1)",
                    }}
                    className="absolute top-0 left-0 w-64 shadow-lg h-screen bg-gray-800 border border-gray-700 z-50 p-5"
                >
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white text-3xl mb-5 focus:outline-none"
                    >
                        ×
                    </button>
                    <ul className="space-y-4 mt-4">
                        <li>
                            <Link
                                to="/"
                                className="flex items-center text-white text-lg font-medium"
                            >
                                <HomeIcon className="mr-3" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center text-white text-lg font-medium"
                            >
                                <InfoIcon className="mr-3" />
                                About
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
};

const Backdrop = React.forwardRef((props, ref) => {
    const { open, className, ...other } = props;
    return (
        <div
            className={clsx({ 'base-Backdrop-open': open }, className)}
            ref={ref}
            {...other}
        />
    );
});

Backdrop.propTypes = {
    className: PropTypes.string.isRequired,
    open: PropTypes.bool,
};

const blue = {
    200: '#99CCFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0066CC',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Modal = styled(BaseModal)`
    position: fixed;
    z-index: 1300;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

const StyledBackdrop = styled(Backdrop)`
    z-index: -1;
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 0.5);
    -webkit-tap-highlight-color: transparent;
  `;

const TriggerButton = styled('button')(
    ({ theme }) => css`
      font-family: 'IBM Plex Sans', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 150ms ease;
      cursor: pointer;
      background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
      border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
      color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
      &:hover {
        background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
        border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
      }
  
      &:active {
        background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
      }
  
      &:focus-visible {
        box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
        outline: none;
      }
    `,
);
