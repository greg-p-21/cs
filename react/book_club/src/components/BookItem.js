import React, { useEffect, useState } from "react";
import axios from "axios";

// import { Link, BrowserRouter as Router, Route, BrowserRouter } from "react-router-dom";
import { getUser } from "../Utils/Common";
import { render } from "react-dom";



function BookItem(props) {
  const { book } = props;
  console.log('bookitem', book);
  const user = getUser();

  const content = useFormInput('');

  const [contentList, setContentList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearBox = () => {
    document.getElementById('myInput').value = '';
  }

  useEffect(() => {
    const getChat = async () => {
      const content = await axios.post('http://localhost:4000/chat/get', {idBooks: book.idBooks});
      console.log("books", content);
      setContentList(content.data);
    }
    getChat();
  }, []);

  const getChat = async () => {
    const content = await axios.post('http://localhost:4000/chat/get', {idBooks: book.idBooks});
    console.log("books", content);
    setContentList(content.data);
  }

  // handle button click of login form
  const sendChat = () => {
      setError(null);
      setLoading(true);
      console.log("send chat", content.value, user.username, book.idBooks);
      axios.post('http://localhost:4000/chat/send', { content: content.value, authorName: user.username, idBooks: book.idBooks }).then(response => {
          setLoading(false);
      }).catch(error => {
          setLoading(false);
          console.log(error.message);
          if (error.response.status === 401) setError(error.response.data.message);
          else setError("Something went wrong. Please try again later.");
      });
      clearBox();
      getChat();
  }
  
  return (
    <div className=" column is-half">
      <div className="box">
        <div className="media">
          {/* <div className="media-left">
            <figure className="image is-64x64">
              <img
                src="https://bulma.io/images/placeholders/128x128.png"
                alt={product.shortDesc}
              />
            </figure>
          </div> */}
          <div className="media-content">
            <b style={{ textTransform: "capitalize" }}>
              {book.title}{" "}
              <span className="tag is-primary">{book.author}</span>
            </b>
            <div>{book.description}</div>
            <div className="is-clearfix">
              <ul>
              {contentList && contentList.length ? (
                contentList.map((c, index) => (
                  <li className="forum">{c.content} - {c.authorName}</li>
                ))
              ) : (
                <h5>No comments yet!</h5>
              )}
              </ul>
            
              <div>
                <input id="myInput" onFocus={clearBox} type ="text" {...content} autoComplete="new-password" style={{width: 80 + '%'}}/>
              
                <input type="button" value={'Chat'} onClick={sendChat} disabled={loading} /><br/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  

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

export default BookItem;