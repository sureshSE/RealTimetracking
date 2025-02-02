import React, { useContext, useEffect, useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { userPermissionPage } from "./userPermission";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const useUserHasPermission = ({ data, moduleName, userType }) => {
    const [render, setRender] = useState(false);
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const hasPermission = userPermissionPage(
                data,
                moduleName,
                userType
            );
            if (!hasPermission) {
                setRender(false);
                showSnackbar("You don't have the permission to access the page", "error")
                navigate("/dashboard");
            } else {
                setRender(true);
            }
        }
    }, [user, data, moduleName, userType]);

    return {
        render,
    };
};

export default useUserHasPermission;
