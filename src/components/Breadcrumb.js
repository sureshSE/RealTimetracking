import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons'; // Import the home icon

const Breadcrumb = ({ paths }) => {
    return (
        <div className="breadcrumb-container" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    {/* Home Icon as the first breadcrumb */}
                    <li className="breadcrumb-item">
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} /> {/* Home icon */}
                        </Link>
                    </li>
                    
                    {/* Dynamically generate breadcrumb items from paths */}
                    {paths.map((path, index) => (
                        <li
                            key={index}
                            className={`breadcrumb-item ${index === paths.length - 1 ? "active" : ""}`}
                            aria-current={index === paths.length - 1 ? "page" : undefined}
                        >
                            {index === paths.length - 1 ? (
                                path.name
                            ) : (
                                <Link to={path.link}>{path.name}</Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumb;
