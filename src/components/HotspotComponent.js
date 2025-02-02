import React, { useState } from "react";
import SearchInPlaceOfInterest from "../components/filter/SearchInPlaceOfInterest"

const TrackingDetails = ({ formData }) => {
  const [placeSearch, setPlaceSearch] = useState(null);
  const [placeSearchtData, SetPlaceSearchData] = useState(formData?.placeOfInterestDetails || []);
  const [filteredTeams, setFilteredTeams] = useState(formData?.placeOfInterestDetails || []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const handlePlaceSearch = (value) => {
    setPlaceSearch(value)
    const filteredResults = SearchInPlaceOfInterest(
      formData?.placeOfInterestDetails || [],
      value
    );
    SetPlaceSearchData(filteredResults)
  }
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
          placeholder="search by location, address"
          name="name"
          value={placeSearch}
          onChange={(e) => { handlePlaceSearch(e.target.value) }}
        />
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {placeSearchtData.length > 0 ? (
            placeSearchtData?.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>
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
