import React, { useState } from "react";
import SearchAgent from "../components/filter/SearchAgent"

const TrackingDetails = ({ formData }) => {
    const [agentSearch, setAgentSearch] = useState(null);
    const [filteredTeams, setFilteredTeams] = useState(formData?.manualLoginDetails || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [agentSearchtData, SetAgentSearchData] = useState(formData?.manualLoginDetails || []);
    const handleAgentSearch = (value) => {
        setAgentSearch(value)
        const filteredResults = SearchAgent(
            formData?.manualLoginDetails || [],
            value
        );
        SetAgentSearchData(filteredResults)
        // setFilteredTeams(filteredResults)
    }
    // Pagination
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);


    return (
        <div>
            <div className="col-md-5">
                <input
                    type="text"
                    className="form-control"
                    placeholder="search by location, notes"
                    name="name"
                    value={agentSearch}
                    onChange={(e) => { handleAgentSearch(e.target.value) }}
                />
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Visited Location </th>
                        <th>Notes </th>
                    </tr>
                </thead>
                <tbody>

                    {agentSearchtData.length > 0 ? (
                        agentSearchtData.map((item) => (
                            <tr key={item.id}>
                                <td>{new Date(item.date).toLocaleString()}</td>
                                <td>
                            
                                    {item?.fieldTag} :  {item.description}</td>
                                <td>{item.notes}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                    {[...Array(totalPages)].map((_, index) => (
                        <li
                            key={index}
                            className={`page-item ${currentPage === index + 1 ? "active" : ""
                                }`}
                        >
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

        </div>
    );
};

export default TrackingDetails;
