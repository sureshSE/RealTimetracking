import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditAgentTeam = ({ getEmployee, setShowEditModal }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dropdownData, setDropdownData] = useState({
    fieldAgents: [],
    managers: [],
    deputyManagers: [],
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Validation schema
  const schema = Yup.object().shape({
    teamName: Yup.string().required("Team name is required"),
    // fieldAgents: Yup.array()
    //   .min(1, "Select at least one field agent")
    //   .required("Field agents are required"),
    managers: Yup.array()
      .min(1, "Select at least one manager")
      .required("Managers are required"),
    deputyManagers: Yup.array()
      .min(1, "Select at least one deputy manager")
      .required("Deputy managers are required"),
  });

  useEffect(() => {
    if (user) {
      fetchAllRoles();
    }
  }, [user]);

  const fetchAllRoles = async () => {
    try {
      const roles = [
        { roleId: 1, key: "fieldAgents" },
        { roleId: 2, key: "managers" },
        { roleId: 3, key: "deputyManagers" },
      ];

      const requests = roles.map((role) =>
        fetchRole(role.roleId).then((data) => ({
          key: role.key,
          options: data.map((agent) => ({
            value: agent.fieldAgentId,
            label: agent.nickName || "Agent",
          })),
        }))
      );

      const results = await Promise.all(requests);

      const newDropdownData = results.reduce(
        (acc, { key, options }) => ({
          ...acc,
          [key]: options,
        }),
        {}
      );

      setDropdownData(newDropdownData);
    } catch (error) {
      setErrorMessage("Failed to load dropdown data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRole = async (roleId) => {
    try {
      const response = await axios.get(
        `https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentByRoleId/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data.data || [];
    } catch {
      throw new Error("Failed to fetch role data");
    }
  };

  const initializeFormValues = () => {
    const mapSelectedOptions = (agents, roleKey) =>
      agents
        ?.filter((agent) => agent.role === roleKey)
        .map((agent) => ({
          value: agent.fieldAgentId,
          label: agent.nickName || agent.name,
        })) || [];

    return {
      teamName: getEmployee?.teamName || "",
      fieldAgents: mapSelectedOptions(getEmployee?.fieldAgents, "FieldAgent"),
      managers: mapSelectedOptions(getEmployee?.fieldAgents, "Manager"),
      deputyManagers: mapSelectedOptions(
        getEmployee?.fieldAgents,
        "Deputy Manager"
      ),
    };
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initializeFormValues(),
    validationSchema: schema,
    onSubmit: async (data) => {
      // const payload = {
      //   teamName: data.teamName,
      //   fieldAgents:
      //     user?.role?.role === "FieldAgent"
      //       ? []
      //       : (data.fieldAgents || []).map((option) => ({
      //           fieldAgentId: option.value,
      //         })),
      //   managers:
      //     user?.role?.role === "Deputy Manager" ||
      //     user?.role?.role === "Manager"
      //       ? [{ fieldAgentId: user.fieldAgentId }]
      //       : (data.managers || []).map((option) => ({
      //           fieldAgentId: option.value,
      //         })),
      //   deputyManagers:
      //     user?.role?.role === "Deputy Manager"
      //       ? [{ fieldAgentId: user.fieldAgentId }]
      //       : (data.deputyManagers || []).map((option) => ({
      //           fieldAgentId: option.value,
      //         })),
      //   created_by: user.fieldAgentId,
      // };

      try {
        await axios.put(
          `https://uat-tracking.rmtec.in/api/teams/editTeamDetail/${getEmployee?.teamId}`,
          {
            teamName: data.teamName,
            fieldAgents:
              user?.role?.role === "FieldAgent"
                ? []
                : (data.fieldAgents || []).map((option) => ({
                    fieldAgentId: option.value,
                  })),
            managers:  (data.managers || []).map((option) => ({
                    fieldAgentId: option.value,
                  })),
            deputyManagers:
              (data.deputyManagers || []).map((option) => ({
                    fieldAgentId: option.value,
                  })),
            created_by: user.fieldAgentId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSuccessMessage("Team updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          navigate("/field-agent/agent-team-list");
        }, 1000);
      } catch {
        setErrorMessage("Failed to update the team.");
      }
    },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <Modal show onHide={() => setShowEditModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label>Team Name</label>
            <input
              type="text"
              name="teamName"
              value={formik.values.teamName}
              onChange={formik.handleChange}
              className="form-control"
              placeholder="Enter Team Name"
            />
            {formik.errors.teamName && (
              <p className="text-danger">{formik.errors.teamName}</p>
            )}
          </div>
          <div className="mb-3">
            <label>Field Agents</label>
            <Select
              isMulti
              options={dropdownData.fieldAgents}
              value={formik.values.fieldAgents}
              onChange={(selected) =>
                formik.setFieldValue("fieldAgents", selected)
              }
            />
            {/* {formik.errors.fieldAgents && (
              <p className="text-danger">{formik.errors.fieldAgents}</p>
            )} */}
          </div>
          <div className="mb-3">
            <label>Managers</label>
            <Select
              isMulti
              options={dropdownData.managers}
              value={formik.values.managers}
              isDisabled={
                user?.role?.role === "Deputy Manager" ||
                user?.role?.role === "Manager"
                  ? true
                  : false
              }
              onChange={(selected) =>
                formik.setFieldValue("managers", selected)
              }
            />
            {formik.errors.managers && (
              <p className="text-danger">{formik.errors.managers}</p>
            )}
          </div>
          <div className="mb-3">
            <label>Deputy Managers</label>
            <Select
              isMulti
              options={dropdownData.deputyManagers}
              value={formik.values.deputyManagers}
              isDisabled={user?.role?.role === "Deputy Manager" ? true : false}
              onChange={(selected) =>
                formik.setFieldValue("deputyManagers", selected)
              }
            />
            {formik.errors.deputyManagers && (
              <p className="text-danger">{formik.errors.deputyManagers}</p>
            )}
          </div>
          <Button type="submit" className="btn btn-primary">
            Update Team
          </Button>
        </form>
        {successMessage && (
          <div className="alert alert-success mt-3">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger mt-3">{errorMessage}</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditAgentTeam;
