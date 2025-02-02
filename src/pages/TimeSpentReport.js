import React from 'react';
import { Card, Table } from 'react-bootstrap';
import '../assets/css/TimeSpentReport.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const TimeSpentReport = () => {
    // Array of agent details
    const agents = [
        {
            name: "John Doe",
            designation: "Field Agent",
            location: "New York, USA",
            team: "Team A",
            profile: "Handles on-site tasks and client interactions.",
            phone: "9791789306",
            email: "prakash.m@rosemallowtech.com",
            workLog: [
                { id: 1, date: "11/11/24", place: "Coimbatore", startTime: "05:33 PM", endTime: "06:33 PM", timeSpent: "1 Hr" },
            ],
        },
        {
            name: "Jane Smith",
            designation: "Sales Executive",
            location: "Los Angeles, USA",
            team: "Team B",
            profile: "Manages client relationships and sales activities.",
            phone: "9876543210",
            email: "jane.smith@example.com",
            workLog: [
                { id: 1, date: "12/11/24", place: "Los Angeles", startTime: "09:00 AM", endTime: "10:30 AM", timeSpent: "1.5 Hr" },
                { id: 2, date: "12/11/24", place: "Santa Monica", startTime: "11:00 AM", endTime: "12:00 PM", timeSpent: "1 Hr" },
            ],
        },
    ];

    return (
        <>
        <h3 className='title-time'>TimeSpent Report (Field Agent)</h3>
        <div className="container py-4 time-agent">
            {agents.map((agent, index) => (
                <div key={index} className="row mb-4">
                    <div className="col-md-12 time-details">
                        {/* Display agent details */}
                        <Card className="mb-3 time-agent-details-card">
                            <div className="d-flex align-items-center">
                                {/* <img
                                    src={agent.image}
                                    alt={agent.name}
                                    className="time-agent-image"
                                /> */}
                                <Card.Body className="ms-3">
                                    <Card.Text>
                                        <strong>Agent Name:</strong> {agent.name}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Designation:</strong> {agent.designation}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Team:</strong> {agent.team}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Location:</strong> {agent.location}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Phone Number:</strong> {agent.phone}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Email Id:</strong> {agent.email}
                                    </Card.Text>
                                </Card.Body>
                            </div>
                        </Card>

                        {/* Table for agent work logs */}
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Date</th>
                                    <th>Place Name</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Time Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agent.workLog.map((log) => (
                                    <tr key={log.id}>
                                        <td>{log.id}</td>
                                        <td>{log.date}</td>
                                        <td>{log.place}</td>
                                        <td>{log.startTime}</td>
                                        <td>{log.endTime}</td>
                                        <td>{log.timeSpent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            ))}
        </div></>
    );
};

export default TimeSpentReport;
