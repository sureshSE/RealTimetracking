import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";

// create context
export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshTokens = useCallback(() => {
    const userId = localStorage.getItem("userDetails");
    if (userId) {
      return axios
        .get(
          `https://uat-tracking.rmtec.in/api/fieldAgent/getAgentById/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          setUser(response?.data?.data);

          return response;
        })
        .catch((error) => {
          setUser(null);
          return error;
        });
    }
  }, []);

  useEffect(() => {
    refreshTokens()
  }, [refreshTokens]);

  const value = useMemo(() => {
    const getUserDetails = () => {
      const userId = localStorage.getItem("userDetails");

      return axios
        .post(
          `https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentById/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((resp) => {
          setUser(resp);
        })
        .catch(console.error());
    };

    return {
      user,
      setUser,
      getUserDetails,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
