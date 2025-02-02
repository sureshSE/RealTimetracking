import React from "react";
import adminLayout from "../hoc/adminLayout"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
class AdminBlankPage extends React.Component {
    constructor(props){
        super(props);

        this.state = {}
    }

    render(){
        return <>
            <p>Content here..</p>
        </>
    }
}

export default adminLayout(AdminBlankPage);