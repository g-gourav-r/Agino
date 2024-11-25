import React from 'react';
import { RotatingSquare as Spinner } from 'react-loader-spinner';

const RotatingSquareLoader = () => {
    return (
        <Spinner
            visible={true}
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="rotating-square-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    );
};

export default RotatingSquareLoader;
