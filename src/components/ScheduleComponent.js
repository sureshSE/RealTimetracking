import React, { useState } from "react";
import searchInSchedule from "../components/filter/SearchInSchedule"

const ScheduledVisitTable = ({ formData = [] }) => {

    const [scheduleSearch, setScheduleSearch] = useState(null);
    const [scheduleSearchtData, SetScheduleSearchData] = useState(formData?.scheduledVisitTrackDetails || []);
    const [filteredTeams, setFilteredTeams] = useState(formData?.scheduledVisitTrackDetails || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const handleScheduleSearch = (value) => {
        setScheduleSearch(value)
        const filteredResults = searchInSchedule(
            formData?.scheduledVisitTrackDetails || [],
            value
        );
        SetScheduleSearchData(filteredResults)
    }

    const timeAgo = (givenDate, currentDate = new Date()) => {
        const start = new Date(givenDate);
        const end = new Date(currentDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return "-"
        }
        const diffInMs = end - start;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
        } else if (diffInHours > 0) {
            return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
        } else if (diffInMinutes > 0) {
            return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
        } else {
            return "Just now";
        }
    };

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
                    placeholder="search by location, status"
                    name="name"
                    value={scheduleSearch}
                    onChange={(e) => { handleScheduleSearch(e.target.value) }}
                />
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {scheduleSearchtData.length > 0 ? (
                        scheduleSearchtData.map((item) => (
                            <tr key={item.id}>
                                <td>{new Date(item.date).toLocaleString()}</td>
                                <td>
                                 
                            {item?.fieldTag} :   {item.description}
                                </td>
                                <td>{item.taskStatus}</td>
                                <td>{timeAgo(item.date)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No data available</td>
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

export default ScheduledVisitTable;
