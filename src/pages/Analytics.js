import React from "react";
import adminLayout from "../hoc/adminLayout";
import AnalyticsComponent from "../components/map/AnalyticsComponent"; // Adjust the path according to your file structure
// import '../assets/css/bootstrap.min.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import useHasPermission from "../utils/permission/pageAccess";
// import { Helmet } from "react-helmet";
import { Helmet, HelmetProvider } from 'react-helmet-async';
const Analytics = () => {


    const { render } = useHasPermission({
        moduleName: "analytics",
    });
    // const breadcrumbPaths = [
    //     { name: "Home", link: "/" },
    //     { name: "Analytics", link: "/analytics" },
    // ];
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Analytics - RealTimeTracking</title>
                    <meta name="description" content="Overview of employee performance and metrics." />
                    <meta name="keywords" content="dashboard, employee, management" />
                </Helmet>
            </HelmetProvider>
            {render && (
                <>

                    <h3 className="title">Analytics</h3>
                    <div className="analytics-con">
                        <AnalyticsComponent />
                    </div>
                </>
            )}
        </>
    );
};

export default adminLayout(Analytics);
