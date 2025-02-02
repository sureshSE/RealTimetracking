
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarData, SidebarDataAgent } from "./SidebarData";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../assets/css/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menu, setMenu] = useState([])


    const { user } = useContext(AuthContext);

    // Check if a link is active
    const isActive = (path, exact = true) => {
        return exact ? location.pathname === path : location.pathname.startsWith(path);
    };

    // Logout function
    const logout = async () => {
        try {
            await signOut(auth).then(() => {
                console.log("User logged out successfully");
                localStorage.clear();
                navigate("/login");
            });
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    const getNavLinkClass = (path) => {
        return `nav-link py-3 ${isActive(path) ? "active" : ""}`;
    };

    // working on role based filter function 

    const filterMenuItems = (data, privilege) => {
        if (!privilege) {
            return [];
        }
        const filteredMenu = data.filter(item => privilege[item.name] === "1");
        return filteredMenu;
    };

    // useEffect(() => {
    //     if (!user) {
    //         return;
    //     }

    //     if (user?.role?.role === "SuperAdmin") {
    //         setMenu(SidebarData); // If role is Admin, show all menu items
    //     } else if (user?.role?.role === "FieldAgent") {
    //         const filteredMenu = filterMenuItems(SidebarDataAgent, user?.privilege);
    //         setMenu(filteredMenu);
    //     }
    //     else if (user?.role?.role === "Manager" || user?.role?.role === "DeputyManager") {
    //         const filteredMenu = filterMenuItems(SidebarData, user?.privilege);
    //         setMenu(filteredMenu);
    //     } else {
    //         setMenu([]);
    //     }
    // }, [user]);

    useEffect(() => {
        try {
            if (!user) {
                setMenu([]);
                return;
            }

            if (user?.role?.role === "SuperAdmin") {
                setMenu(SidebarData); // If role is SuperAdmin, show all menu items
            } else if (user?.role?.role === "FieldAgent") {
                if (!user?.privilege) {
                    console.error("Privilege data is missing for FieldAgent.");
                    setMenu([]);
                    return;
                }
                const filteredMenu = filterMenuItems(SidebarDataAgent, user?.privilege);
                setMenu(filteredMenu);
            } else if (user?.role?.role === "Manager" || user?.role?.role === "Deputy Manager") {
                if (!user?.privilege) {
                    console.error("Privilege data is missing for Manager or DeputyManager.");
                    setMenu([]);
                    return;
                }
                const filteredMenu = filterMenuItems(SidebarData, user?.privilege);
                setMenu(filteredMenu);
            } else {
                setMenu([]); // Default case: clear menu
            }
        } catch (error) {
            console.error("Error while setting menu:", error);
            setMenu([]);
        }
    }, [user]);




    return (
        <div className="sidebar d-flex flex-column align-items-center p-3 border-end">
            <ul className="nav nav-pills flex-column mb-auto text-center">
                {menu?.map((item, index) => (
                    <li key={index} className="nav-item">
                        <Link
                            to={item.path}
                            className={getNavLinkClass(item.path)}
                            title={item.title}
                        >
                            {item.icon}
                        </Link>
                    </li>

                ))}
                <li>
                    <Link
                        to="#"
                        className={`nav-link py-3 ${isActive('/login') ? 'active' : ''}`}
                        title="Sign Out"
                        onClick={logout}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;

