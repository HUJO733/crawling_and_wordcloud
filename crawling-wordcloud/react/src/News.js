import React from "react";
import NewsItem from "./NewsItem";
import "./News.css";

const News = () => {
  return (
    <div>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/cLYg_M5jo00"
        frameborder="0"
        allowfullscreen
      ></iframe>
      <NewsItem />
    </div>
  );
};

export default News;
