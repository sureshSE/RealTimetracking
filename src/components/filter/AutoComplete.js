import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const CustomAutocomplete = ({
    options = [],
    value,
    onChange,
    label = "Select",
    placeholder = "Type to search...",
    disableClearable = false,
    sx = {},
    getOptionLabel = (option) => option?.name || "", // Default getOptionLabel
    ...otherProps
}) => {
    return (
        <Autocomplete
            options={options}
            getOptionLabel={getOptionLabel}
            
            value={value}
            onChange={onChange}
             disableClearable={true}
            sx={{
                width: "100%",
                ...sx,
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    // placeholder={placeholder}
                    variant="outlined"
                />
            )}
            {...otherProps}
        />
    );
};

export default CustomAutocomplete;
