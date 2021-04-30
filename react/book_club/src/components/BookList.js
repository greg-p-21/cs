import axios from "axios";
import React, { useEffect, useState } from "react";
import BookItem from "./BookItem";
// import withContext from "../withContext";

function BookList(props) {
  console.log(props)
  const [bookList, setBookList] = useState([]);

  useEffect(() => {
    const getBooks = async () => {
      const books = await axios.get('http://localhost:4000/books');
      console.log("books", books);
      setBookList(books.data);
    }
    getBooks();
  }, []);

  return (
    <>
      <div className="hero is-primary">
        <div className="hero-body container">
          <h4 className="title">Our Books</h4>
        </div>
      </div>
      <br />
      <div className="container">
        <div className="column columns is-multiline">
          {bookList && bookList.length ? (
            bookList.map((book, index) => (
              <BookItem
                book={book}
                key={index}
              />
            ))
          ) : (
            <div className="column">
              <span className="title has-text-grey-light">
                No books found!
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookList;
// const BookList = props => {
//   const { products } = props.context;

//   return (
//     <>
//       <div className="hero is-primary">
//         <div className="hero-body container">
//           <h4 className="title">Our Books</h4>
//         </div>
//       </div>
//       <br />
//       <div className="container">
//         <div className="column columns is-multiline">
//           {products && products.length ? (
//             products.map((product, index) => (
//               <BookItem
//                 product={product}
//                 key={index}
//                 addToCart={props.context.addToCart}
//               />
//             ))
//           ) : (
//             <div className="column">
//               <span className="title has-text-grey-light">
//                 No books found!
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default withContext(BookList);
