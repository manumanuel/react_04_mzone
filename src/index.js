import React from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating";
import "./index.css";
import App from "./App";

function Test() {
  const [movieRating, setMovieRating] = React.useState(0);
  return (
    <div>
      <div>
        <StarRating color="brown" onSetRating={setMovieRating} />
      </div>
      <p>Your current rating for the movie is {movieRating}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      size={30}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating maxRating={15} size={40} color={"blue"} />
    <StarRating maxRating={25} defaultRating={3} color="black" size={40} />
    <Test /> */}
  </React.StrictMode>
);
