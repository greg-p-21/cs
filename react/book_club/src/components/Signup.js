import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from '../Utils/Common';

function Signup(props) {
    const name = useFormInput('');    
    const username = useFormInput('');
    const password = useFormInput('');
    const cpwd = useFormInput('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // handle button click of login form
    const handleSignup = () => {
        setError(null);
        setLoading(true);
        axios.post('http://localhost:4000/users/signup', { username: username.value, password: password.value, name: name.value, cpwd: cpwd.value }).then(response => {
            setLoading(false);
            setUserSession(response.data.token, response.data.user);
            props.history.push('/book-list');
        }).catch(error => {
            setLoading(false);
            console.log(error.message);
            if (error.response.status === 401) setError(error.response.data.message);
            else setError("Something went wrong. Please try again later.");
        });
    }

    return (
        <div>
            Signup<br /><br />
            <div>
                Name<br/>
                <input type ="text" {...name} autoComplete="new-password" />
            </div>
            <div style={{ marginTop: 10}}>
                Username<br/>
                <input type ="text" {...username} autoComplete="new-password" />
            </div>
            <div style={{ marginTop: 10}}>
                Password<br/>
                <input type="password" {...password} autoComplete="new-password" />
            </div>
            <div style={{ marginTop: 10}}>
                Confirm Password<br/>
                <input type="password" {...cpwd} autoComplete="new-password" />
            </div>
            {error && <><small style={{ color: 'red'}}>{error}</small><br/></>}<br />
            <input type="button" value={loading ? 'Loading...' : 'Signup'} onClick={handleSignup} disabled={loading} /><br/>

        </div>
    );
}

const useFormInput = initialValue => {
    const [value, setValue] = useState(initialValue);

    const handleChange = e => {
        setValue(e.target.value);
    }
    return {
        value,
        onChange: handleChange
    }
}

export default Signup;