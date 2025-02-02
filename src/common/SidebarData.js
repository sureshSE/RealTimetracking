import {
    faHome,
    faMapMarkerAlt,
    faUsers,
    faChartLine,
    faClock,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const SidebarData = [
    {
        title: "Overview",
        path: "/",
        icon: <FontAwesomeIcon icon={faHome} />,
        name: "overview",
    },
    {
        title: "RealTime Tracking",
        path: "/realtime-tracking",
        icon: <FontAwesomeIcon icon={faMapMarkerAlt} />,
        name: "realTimeTracking",

    },
    {
        title: "Field Agent Management",
        path: "/field-agent-management",
        icon: <FontAwesomeIcon icon={faUsers} />,
        name: "fieldAgent",

    },
    {
        title: "Analytics",
        path: "/analytics",
        icon: <FontAwesomeIcon icon={faChartLine} />,
        name: "analytics",
    },
    {
        title: "Time Spent",
        path: "/timespent",
        icon: <FontAwesomeIcon icon={faClock} />,
        name: "timeSpent",

    },
    {
        title: "Profile",
        path: "/profile",
        icon: <FontAwesomeIcon icon={faUser} />,
        name: "reports",

    },
    // {
    //     title: "Sign Out",
    //     path: "#",
    //     icon: <FontAwesomeIcon icon={faSignOutAlt} />,
    //     action: "logout", // Special case for logout
    //     name: "logOut",
    // },
];

export const SidebarDataAgent = [
    {
        title: "Overview",
        path: "/",
        icon: <FontAwesomeIcon icon={faHome} />,
        name: "overview",
    },
    {
        title: "RealTime Tracking",
        path: "/realtime-tracking",
        icon: <FontAwesomeIcon icon={faMapMarkerAlt} />,
        name: "realTimeTracking",

    },
    // {
    //     title: "Field Agent Management",
    //     path: "/field-agent-management",
    //     icon: <FontAwesomeIcon icon={faUsers} />,
    //     name: "fieldAgent",

    // },
    {
        title: "Analytics",
        path: "/analytics",
        icon: <FontAwesomeIcon icon={faChartLine} />,
        name: "analytics",
    },
    {
        title: "Time Spent",
        path: "/timespent",
        icon: <FontAwesomeIcon icon={faClock} />,
        name: "timeSpent",

    },
    {
        title: "Profile",
        path: "/profile",
        icon: <FontAwesomeIcon icon={faUser} />,
        name: "reports",

    },

];



