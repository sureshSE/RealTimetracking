import { AuthContext } from "../../context/AuthContext";
import { userPermissionPage } from "./userPermission";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";

const useHasPermission = ({ moduleName }) => {
    const [render, setRender] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();  // Get the showSnackbar function

    useEffect(() => {
        if (user) {
            const hasPermission = userPermissionPage(
                user?.privilege,
                moduleName,
                user?.role?.role
            );
            if (!hasPermission && user) {
                setRender(false);
                showSnackbar("You don't have the permission to access the page", "error")
                navigate("/dashboard");
            } else {
                setRender(true);
            }
        }
    }, [user]);
    return {
        render,
    };
};

export default useHasPermission;
