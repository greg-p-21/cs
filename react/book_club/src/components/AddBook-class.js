import React, { Component } from "react";
import withContext from "../withContext";
// import { Redirect } from "react-router-dom";
import axios from 'axios';

const initState = {
  title: "",
  author: "",
  description: ""
};

class AddBook extends Component {
  constructor(props) {
    super(props);
    this.state = initState;
  }

  save = async (e) => {
    e.preventDefault();
    const { title, author, description } = this.state;

    if (title && author && description) {
    //   const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

      await axios.post(
        'http://localhost:4000/books/add',
        { title, author, description },
      )

      this.props.context.addBook(
        {
          title,
          author,
          description
        },
        () => this.setState(initState)
      );
      this.setState(
        { flash: { status: 'is-success', msg: 'Book created successfully' }}
      );

    } else {
      this.setState(
        { flash: { status: 'is-danger', msg: 'Please enter name, author and description' }}
      );
    }
  };

  handleChange = e => this.setState({ [e.target.title]: e.target.value, error: "" });

  render() {
    const { title, author, description } = this.state;
    // const { user } = this.props.context;

    return (
      <>
        <div className="hero is-primary ">
          <div className="hero-body container">
            <h4 className="title">Add Product</h4>
          </div>
        </div>
        <br />
        <br />
        <form onSubmit={this.save}>
          <div className="columns is-mobile is-centered">
            <div className="column is-one-third">
              <div className="field">
                <label className="label">Book Name: </label>
                <input
                  className="input"
                  type="text"
                  name="name"
                  value={title}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Author: </label>
                <input
                  className="input"
                  type="number"
                  name="price"
                  value={author}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Description: </label>
                <textarea
                  className="textarea"
                  type="text"
                  rows="2"
                  style={{ resize: "none" }}
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                />
              </div>
              {this.state.flash && (
                <div className={`notification ${this.state.flash.status}`}>
                  {this.state.flash.msg}
                </div>
              )}
              <div className="field is-clearfix">
                <button
                  className="button is-primary is-outlined is-pulled-right"
                  type="submit"
                  onClick={this.save}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default withContext(AddBook);
