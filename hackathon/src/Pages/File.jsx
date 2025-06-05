import React, { useEffect, useState } from "react";
import "./file.css";
import { LinearProgress, Box, Typography, Grid, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import Avatar from '@mui/material/Avatar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from "react-router-dom";
AOS.init();

const FileUploader = () => {
    const [apkFile, setApkFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [download, setDownload] = useState(false);

    useEffect(() => {
        if (uploaded) {
            setDownload(true);
        }
    }, [uploaded])
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setApkFile(file);
            setProgress(0);

            const simulateUpload = setInterval(() => {
                setProgress((oldProgress) => {
                    if (oldProgress === 100) {
                        clearInterval(simulateUpload);
                        return 100;
                    }
                    return Math.min(oldProgress + 10, 100);
                });
            }, 500);
        }
    };
    const handleUploadClick = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setUploaded(true);
        }, 5000);
    };

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <div className="flex" style={{ width: "100%" }}>
                <Sidebar />
                <div style={{ width: "100%" }}>
                    <Box className="flex" p={6} sx={{ width: "100%", height: "50vh" }}>
                        <div style={{ width: "100%", height: "50vh" }} className="flex gap-6">
                            <div data-aos="zoom-in" data-aos-delay="250" style={{ width: "100%", background: "rgba(250, 250, 250, 1)", borderRadius: "15px" }} className="flex shadow-lg justify-center border items-center">
                                <div style={{ width: "100%" }} className="p-12">
                                    <label style={{ width: "100%" }} className="custum-file-upload" htmlFor="file">
                                        <div className="icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    fill=""
                                                    d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                ></path>
                                            </svg>
                                        </div>
                                        <div className="text">
                                            <span>Click to upload APK</span>
                                        </div>
                                        <input
                                            type="file"
                                            id="file"
                                            accept=".apk"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <Box sx={{ width: "100%", mt: 2 }}>
                                        <LinearProgress
                                            sx={{ color: "white", background: "white" }}
                                            variant="determinate"
                                            value={progress}
                                        />
                                    </Box>
                                    {progress === 100 && (
                                        <div>
                                            <Typography
                                                className=""
                                                variant="body1"
                                                sx={{ mt: 2 }}

                                            >
                                                <strong className="">File name: </strong>
                                                {apkFile.name}
                                            </Typography>
                                            <Typography className="" mt={1} variant="body1">
                                                <strong className="">File size: </strong>
                                                {(apkFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {progress === 100 && (
                                <div data-aos="zoom-in-left" style={{ width: "100%", background: "rgba(250, 250, 250, 1)", borderRadius: "15px" }} className="flex justify-center border shadow-lg items-center">
                                    <div className="p-7" style={{ width: "100%" }}>
                                        <Box ml={5}>
                                            <p className="font-sans font-bold text-3xl">Toggle Options</p>
                                            <hr className="my-7" style={{ color: "black", background: "black" }} />
                                            <div className="mb-3 mt-7 flex gap-2">
                                                <label className="switch">
                                                    <input type="checkbox" />
                                                    <span className="slider"></span>
                                                </label>
                                                <p className="">Root detection</p>
                                            </div>
                                            <div className="mb-3 flex gap-2">
                                                <label className="switch">
                                                    <input type="checkbox" />
                                                    <span className="slider"></span>
                                                </label>
                                                <p className="">Screenshot & Screen record</p>
                                            </div>
                                            <div className="mb-3 flex gap-2">
                                                <label className="switch">
                                                    <input type="checkbox" />
                                                    <span className="slider"></span>
                                                </label>
                                                <p className="">Storage permission manage</p>
                                            </div>
                                            <div className="mb-3 flex gap-2">
                                                <label className="switch">
                                                    <input type="checkbox" />
                                                    <span className="slider"></span>
                                                </label>
                                                <p className="">Firewall manage</p>
                                            </div>
                                            <div className="mb-3 flex gap-2">
                                                <label className="switch">
                                                    <input type="checkbox" />
                                                    <span className="slider"></span>
                                                </label>
                                                <p className="">Data encryption</p>
                                            </div>
                                            <Box mt={2} sx={{ float: "right" }}>
                                                <div className="flex gap-3">
                                                    {uploaded ? (
                                                        <div></div>
                                                    )
                                                        : (
                                                            <button
                                                                onClick={handleUploadClick}
                                                                disabled={uploading}
                                                                className="btn flex gap-2 rounded-xl text-white font-sans p-3 px-4 transform hover:scale-110 transition-transform duration-200 ease-in-out"
                                                                style={{ background: "rgba(80, 0, 202, 1)" }}
                                                            >
                                                                <FileUploadIcon />
                                                                {uploading ? "Modyfing API...." : "Upload"}
                                                            </button>
                                                        )}
                                                </div>
                                            </Box>
                                        </Box>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Box>
                    <Box p={6} mt={8} width="100%">
                        <div
                            data-aos="zoom-in"
                            style={{
                                height: "20vh",
                                borderRadius: "15px",
                                display: download ? "flex" : "none",
                                animation: download ? "crackerEffect 1s ease-in-out" : "",
                            }}
                            id="back"
                            className="flex justify-center items-center gap-3 bg-red-600"
                        >
                            <div>
                                <button className="btn bg-black p-3 px-4 text-white font-bold rounded-xl hover:scale-110 transition-transform duration-200 ease-in-out">
                                    Download APK
                                </button>
                            </div>
                        </div>
                    </Box>

                </div>
            </div>
        </div>
    );
};

export default FileUploader;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{ background: "rgba(80, 0, 202, 1)", borderTopRightRadius: "15px", borderBottomRightRadius: "15px" }} className={`flex ${isOpen ? "w-64" : "w-20"} transition-width duration-300 h-screen p-5 pt-8 shadow-lg`}>
            <div className="flex flex-col h-full justify-between">
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white text-3xl mb-5 focus:outline-none"
                    >
                        ☰
                    </button>

                    <ul className="space-y-4 mt-4" style={{ width: "100%" }}>
                        <li>
                            <Link to="/">
                                <a href="#" style={{ width: "100%" }} className="flex items-center text-white text-lg font-medium">
                                    <span className={`material-icons ${isOpen ? "mr-3" : ""}`} style={{ display: isOpen ? "none" : "flex" }}><HomeIcon /></span>
                                    {isOpen && <span className="flex gap-5"><HomeIcon /><p>Home</p></span>}
                                </a>
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="flex items-center text-white text-lg font-medium">
                                <span className={`material-icons ${isOpen ? "mr-3" : ""}`} style={{ display: isOpen ? "none" : "flex" }}><InfoIcon /></span>
                                {isOpen && <span className="flex gap-5"><InfoIcon /> About</span>}
                            </a>
                        </li>

                    </ul>
                </div>
                <div>
                    <a href="#" className="flex items-center text-white text-lg font-medium">
                        <span className={`material-icons ${isOpen ? "mr-3" : ""}`} style={{ display: isOpen ? "none" : "flex" }}>
                            <Avatar alt="Remy Sharp" src="https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg" />
                        </span>
                        {isOpen && <span className="flex gap-5">
                            <Avatar alt="Remy Sharp" src="https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg" />
                            <p className="mt-2">Account</p></span>}
                    </a>
                </div>
            </div>
        </div>
    );
};