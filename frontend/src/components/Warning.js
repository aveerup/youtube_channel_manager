import React from "react";

const Warning = ({ message }) => {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Warning! </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

export default Warning;