import React from "react";
import adminLayout from "../hoc/adminLayout";
// import '../assets/css/bootstrap.min.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../assets/css/FieldAgent.css';
// import { Helmet } from "react-helmet";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faList, faLock, faUsersCog, faUserFriends, faUserTag } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons
import useHasPermission from "../utils/permission/pageAccess";
const FieldAgentManagement = () => {

    const { render } = useHasPermission({
        moduleName: "fieldAgent",
    });
    const cards = [
        {
            title: "Create Agent",
            description: "Add a new field agent to the system.",
            icon: faUserPlus,
            link: "/field-agent/field-agent-add"
        },
        {
            title: "Agent Detalis",
            description: "View and manage the list of field agents.",
            icon: faList,
            link: "/field-agent/field-agent-list"
        },
        {
            title: "Agent Privileges",
            description: "Manage privileges for individual agents.",
            icon: faLock,
            link: "/field-agent/agent-privileges"
        },

        {
            title: "Create Team",
            description: "Add a new agent team.",
            icon: faUserFriends,
            link: "/field-agent/agent-team-add"
        },
        {
            title: "Team Details ",
            description: "View and manage agent teams.",
            icon: faUserTag,
            link: "/field-agent/agent-team-list"
        },
        {
            title: "Team Privileges",
            description: "Manage privileges for agent teams.",
            icon: faUsersCog,
            link: "/field-agent/agent-team-privileges"
        }
    ];


    return (

        <>
            {render && (
                <>

                    <h3 className="title">Field Agent Management</h3>

                    <div className="container py-4 fieldagentmange">
                        <div className="row">
                            {cards.map((card, index) => (
                                <div key={index} className="col-md-4 mb-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body text-center">
                                            <FontAwesomeIcon icon={card.icon} size="3x" className="mb-3" />
                                            <h5 className="card-title">{card.title}</h5>
                                            <p className="card-text">{card.description}</p>
                                            <a href={card.link} className="btn btn-primary field-btn">
                                                Cilck here
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
export default adminLayout(FieldAgentManagement);

