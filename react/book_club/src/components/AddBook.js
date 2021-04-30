import React, { useState } from 'react';
import axios from 'axios';
// import { setUserSession } from '../Utils/Common';

function AddBook(props) {
    const title = useFormInput('');
    const author = useFormInput('');
    const description = useFormInput('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // handle button click of login form
    const addBook = () => {
        setError(null);
        setLoading(true);
        axios.post('http://localhost:4000/books/add', 
        { 
            title: title.value, 
            author: author.value,
            description: description.value
        }).then(response => {
            setLoading(false);
            props.history.push('/dashboard');
        }).catch(error => {
            setLoading(false);
            console.log(error.message);
            if (error.response.status === 401) setError(error.response.data.message);
            else setError("Something went wrong. Please try again later.");
        });
    }

    return (
        <div>
            Add Book<br /><br />
            <div>
                Title<br/>
                <input type ="text" {...title} autoComplete="new-password" />
            </div>
            <div style={{ marginTop: 10}}>
                 Author<br/>
                <input type ="text" {...author} autoComplete="new-password" />
            </div>
            <div style={{ marginTop: 10}}>
                 Description<br/>
                <input type ="text" {...description} autoComplete="new-password" />
            </div>
            {error && <><small style={{ color: 'red'}}>{error}</small><br/></>}<br />
            <input type="button" value={loading ? 'Loading...' : 'Submit'} onClick={addBook} disabled={loading} /><br/>

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

export default AddBook;