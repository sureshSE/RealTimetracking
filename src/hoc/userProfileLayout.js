import React, { useEffect } from "react";
import adminLayout from "../hoc/adminLayout";
import "./../assets/css/profile.css";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";

const userProfileLayout = (ChildComponent) => {
  const UserProfilePageHoc = (props) => {
    const [userName, setUserName] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
      if (user) {
        setUserName(user);
      }
    }, [user]);

    console.log("---------userProfileLayout---user----->", user);

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <div className="profile-sidebar">
              <div className="my-3 p-3 bg-body rounded shadow-sm">
                {/* <!-- SIDEBAR USERPIC --> */}
                <div className="profile-userpic">
                  {userName.name ? (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userName.name
                      )}&background=007bff&color=fff&size=150`}
                      className="img-responsive profile-img-center"
                      alt={userName.name}
                      title={userName.name}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/150"
                      className="img-responsive profile-img-center"
                      alt="Default Avatar"
                    />
                  )}
                </div>

                {/* <!-- END SIDEBAR USERPIC -->
                                <!-- SIDEBAR USER TITLE --> */}
                <div className="profile-usertitle">
                  <div className="profile-usertitle-name">
                    {user.nickName || user.name}
                  </div>
                  <div className="profile-usertitle-job">{user.role.role}</div>
                </div>
                <hr />
                <div>
                  {/* <div className="bd-example">
                                        <div className="list-group">
                                            <NavLink
                                                to="/profile"
                                                className={({ isActive }) =>
                                                    `list-group-item list-group-item-action ${
                                                        isActive ? "active" : ""
                                                    }`
                                                }
                                            >
                                                Personal Info
                                            </NavLink>
                                            <NavLink
                                                to="/change-password"
                                                className={({ isActive }) =>
                                                    `list-group-item list-group-item-action ${
                                                        isActive ? "active" : ""
                                                    }`
                                                }
                                            >
                                                Change Password
                                            </NavLink>
                                            <NavLink
                                                to="/preferences"
                                                className={({ isActive }) =>
                                                    `list-group-item list-group-item-action ${
                                                        isActive ? "active" : ""
                                                    }`
                                                }
                                            >
                                                Preferences
                                            </NavLink>
                                        </div>
                                    </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-9">
            <div className="profile-content">
              <ChildComponent {...props} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return adminLayout(UserProfilePageHoc);
};

export default userProfileLayout;
