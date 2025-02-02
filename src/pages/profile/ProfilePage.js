import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/profile.css";
import userProfileLayout from "../../hoc/userProfileLayout";
import { AuthContext } from "../../context/AuthContext";
import EditProfileModal from "./EditProfile";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  // State to manage modal visibility
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

  // Function to toggle the Profile modal
  const toggleProfileModal = () => setShowProfileModal(!showProfileModal);

  // Function to toggle the Personal Info modal
  const togglePersonalInfoModal = () =>
    setShowPersonalInfoModal(!showPersonalInfoModal);

  return (
    <>
      {/* Profile Section */}
      <div className="my-3 p-3 bg-body profile-body rounded shadow-sm">
        <h6 className="border-bottom pb-2 mb-0 mb-3 d-flex align-items-center">
          Profile
          <FontAwesomeIcon
            icon={faEdit}
            className="ms-2 edit-icon"
            style={{ cursor: "pointer" }}
            title="Edit Profile"
            onClick={toggleProfileModal} // Open Profile Edit Modal
          />
        </h6>

        <table className="prof-table prof-table-bordered">
          <tbody>
            <tr>
              <th scope="row" className="w-25">
                Name
              </th>
              <td>{user&&user.name}</td>
              <th scope="row">Mobile</th>
              <td>{user&&user.mobile}</td>
            </tr>
            <tr>
              <th scope="row">FieldAgent Email</th>
              <td>{user&&user.fieldAgentEmail}</td>
              <th scope="row">Team Name</th>
              <td>{user && user.privilege.team.teamName}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for Editing Profile */}
      {showProfileModal && (
        <EditProfileModal showProfileModal={showProfileModal} toggleProfileModal={toggleProfileModal} user={user}/>
        // <div className="modal show" style={{ display: "block" }}>
        //   <div className="modal-dialog">
        //     <div className="modal-content">
        //       <div className="modal-header">
        //         <h5 className="modal-title">Edit Profile</h5>
        //         <button
        //           type="button"
        //           className="btn-close"
        //           onClick={toggleProfileModal}
        //         ></button>
        //       </div>
        //       <div className="modal-body">
        //         {/* Form for editing profile details */}
        //         <form>
        //           <div className="mb-3">
        //             <label className="form-label">Name</label>
        //             <input
        //               type="text"
        //               className="form-control"
        //               defaultValue="Prakash"
        //             />
        //           </div>
        //           <div className="mb-3">
        //             <label className="form-label">Mobile</label>
        //             <input
        //               type="text"
        //               className="form-control"
        //               defaultValue="9876543210"
        //             />
        //           </div>
        //         </form>
        //       </div>
        //       <div className="modal-footer">
        //         <button
        //           type="button"
        //           className="btn btn-secondary"
        //           onClick={toggleProfileModal}
        //         >
        //           Close
        //         </button>
        //         <button type="button" className="btn btn-primary">
        //           Save changes
        //         </button>
        //       </div>
        //     </div>
        //   </div>
        // </div>
      )}

      {/* Personal Info Section */}
      {/* <div className="my-3 p-3 bg-body rounded shadow-sm" style={{ backgroundColor: '#F5F5F5' }}>
                <h6 className="border-bottom pb-2 mb-0 mb-3 d-flex align-items-center">
                    Personal Info
                    <FontAwesomeIcon
                        icon={faEdit}
                        className="ms-2 edit-icon"
                        style={{ cursor: 'pointer' }}
                        title="Edit Personal Info"
                        onClick={togglePersonalInfoModal} // Open Personal Info Edit Modal
                    />
                </h6>

                <table className="prof-table prof-table-bordered">
                    <tbody>
                        <tr>
                            <th scope="row">Full Name</th>
                            <td>John Doe</td>
                            <th scope="row" className="w-25">Door.No</th>
                            <td>02</td>
                        </tr>
                        <tr>
                            <th scope="row">Street Name</th>
                            <td>Demo Street</td>
                            <th scope="row">City</th>
                            <td>New York</td>
                        </tr>
                        <tr>
                            <th scope="row">District</th>
                            <td>District Name</td>
                            <th scope="row">State</th>
                            <td>NY</td>
                        </tr>
                        <tr>
                            <th scope="row">Pincode</th>
                            <td>123456</td>
                            <th scope="row">Country</th>
                            <td>USA</td>
                        </tr>
                    </tbody>
                </table>
            </div> */}

      {/* Modal for Editing Personal Info */}
      {/* {showPersonalInfoModal && (
                <div className="modal show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Personal Info</h5>
                                <button type="button" className="btn-close" onClick={togglePersonalInfoModal}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" defaultValue="John Doe" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Street Name</label>
                                        <input type="text" className="form-control" defaultValue="Demo Street" />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={togglePersonalInfoModal}>Close</button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
    </>
  );
};

export default userProfileLayout(ProfilePage);
