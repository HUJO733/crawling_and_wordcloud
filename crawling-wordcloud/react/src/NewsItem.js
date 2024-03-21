import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "react-js-pagination";

const NewsItem = () => {
  // news : DB 데이터(뉴스 기사 데이터) / useState는 DB 데이터를 저장하기 위해 사용
  const [news, setNews] = useState([]);
  // page : 현재 페이지
  const [page, setPage] = useState(1);
  // currenPosts : 현재 페이지에 보이는 기사들
  const [currenPosts, setCurrenPosts] = useState([]);
  const [sortBy, setSortBy] = useState("latest"); // 정렬(sortBy에 기본값으로 'latest' 설정)
  const [searchTerm, setSearchTerm] = useState(""); // 검색
  const [searchButtonClicked, setSearchButtonClicked] = useState(false); // 검색 버튼
  const [likedArticles, setLikedArticles] = useState([]); // 좋아요

  // articlesPerPage : 한 페이지에서 보이는 기사 개수
  // indexOfLastArticle : 한 페이지의 마지막 기사의 인덱스
  // indexOfFirstArticle : 한 페이지의 첫번째 기사의 인덱스
  const articlesPerPage = 10;
  const indexOfLastArticle = page * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;

  // 뉴스 정보 가져오기
  useEffect(() => {
    // /news 엔드포인트에서 데이터를 가져오는 함수 호출
    axios
      .get("http://localhost:8081/news")
      .then((response) => {
        // 최신순으로 정렬
        const sortedNews = response.data.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );
        setNews(sortedNews);
      })
      .catch((error) => {
        console.error("뉴스 데이터 불러오는 중 에러 발생:", error);
      });
  }, []);

  // 검색
  // searchButtonClicked 상태가 true 이면 검색 버튼이 클릭되었다는 것을 의미하며
  // news 배열에서 searchTerm에 해당하는 뉴스 필터링하고
  // toLowerCase()를 사용해서 대소문자 무시하고 비교해 filteredNews 배열 생성
  // searchButtonClicked 상태가 false 이면 그냥 news의 값을 사용
  const filteredNews = searchButtonClicked
    ? news.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  useEffect(() => {
    // filteredNews 배열에서 현재 페이지에 해당하는 기사들만 currenPosts의 값으로 설정
    // setCurrenPosts() : 현재 페이지에서 보이는 뉴스기사들은 filteredNews를
    // 해당 페이지의 첫 기사의 인덱스부터 마지막 기사의 인덱스까지 잘라서 보여줌
    setCurrenPosts(filteredNews.slice(indexOfFirstArticle, indexOfLastArticle));
  }, [page, filteredNews]);

  // 정렬
  useEffect(() => {
    let sortedNews = [...news];

    // 최신순
    if (sortBy === "latest") {
      sortedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      // 오래된순
    } else if (sortBy === "oldest") {
      sortedNews.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
      // 조회수 높은 순
    } else if (sortBy === "viewsHigh") {
      sortedNews.sort((a, b) => b.views - a.views);
    }

    setNews(sortedNews);
  }, [sortBy]);

  // 로고 클릭시 초기페이지로 돌아감
  const handelLogoClick = () => {
    setPage(1);
    setSearchTerm("");
    setSortBy("latest");
    setSearchButtonClicked(false);
  };

  // 페이지 변화 핸들링 함수
  const handleChangePage = (page) => {
    setPage(page);
  };

  // 검색 핸들링
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색 버튼 핸들링
  const handleSearchButtonClick = () => {
    setSearchButtonClicked(true);
  };

  // 정렬 핸들링
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // 정렬시 1페이지로 이동
  };

  // 기사 클릭 시 조회수 증가(썸네일, 제목에 사용)
  const handleClick = (item) => {
    const clickedNews = news.map((n) =>
      n.idx === item.idx ? { ...n, views: n.views + 1 } : n
    );
    setNews(clickedNews);

    // 서버로 조회수 데이터 전송
    axios
      .post("http://localhost:8081/news/views", {
        idx: item.idx, // idx라는 이름으로 기사 idx 정보를 넘겨줌
        views: item.views + 1, // views라는 이름으로 기사 조회수 정보를 넘겨줌
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));

    // 기사 링크 열기
    window.open(item.url, "_blank");
  };

  // 좋아요
  // 뉴스 데이터 reduce로 배열 순회하면서 'idx'를 키로 하고 해당 기사의 좋아요 여부를 값으로 하는
  // 객체인 likedMap 생성 ▶ 고유식별자인 'idx'를 통해 매핑 역할
  useEffect(() => {
    axios.get("http://localhost:8081/news").then((response) => {
      const likedArticles = response.data.reduce((likedMap, article) => {
        likedMap[article.idx] = article.isLiked;
        return likedMap;
      }, {});
      setLikedArticles(likedArticles);
    });
  }, []);

  // 좋아요 버튼 클릭 시 호출되는 함수
  const handleLikeClick = (idx) => {
    // 좋아요 상태 토글
    const updatedLikedArticles = {
      ...likedArticles,
      [idx]: !likedArticles[idx],
    };
    setLikedArticles(updatedLikedArticles);

    // 서버로 좋아요 상태 업데이트 요청
    axios
      .post("http://localhost:8081/news/likes", {
        idx: idx,
        isLiked: !likedArticles[idx],
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // 
  return (
    <div className="NewsList">
      <h1>
        <strong><em onClick={handelLogoClick} style={{ cursor: "pointer" }}>
          NEWS FEED
        </em></strong>
      </h1>
      {/* 검색 */}
      <input
        type="text"
        placeholder="뉴스 검색"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {/* 검색 버튼 추가 */}
      <button onClick={handleSearchButtonClick}>검색</button>
      {/* 정렬 */}
      <div>
      <select value={sortBy} onChange={handleSortChange}>
      <option value="latest">최신순</option>
      <option value="oldest">오래된순</option>
      <option value="viewsHigh">조회수 높은순</option>
    </select>
    </div>
      {/* 뉴스 목록 */}
      <ul>
      {currenPosts.map((item) => (
        <li key={item.idx}>
          <img
            src={item.image_url}
            alt="뉴스 썸네일"
            onClick={() => handleClick(item)}
            style={{ cursor: "pointer" }}
          />
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(item)}
          >
            {item.title}
          </a>
          {/* 조회수 */}
          <p style={{ display: "inline-block", marginLeft: "50px" }}>
            조회수 : {item.views}
          </p>
          {/* 좋아요 */}
          <button
            style={{ marginLeft: "50px" }}
            className="like-button"
            onClick={() => handleLikeClick(item.idx)}
          >
            {likedArticles[item.idx] ? "❤️" : "🤍"}
          </button>
          <p>{item.pubDate}</p>
        </li>
      ))}
    </ul>
      {/* 페이지네이션 */}
      <Pagination
        activePage={page}
        itemsCountPerPage={articlesPerPage}
        totalItemsCount={filteredNews.length}
        pageRangeDisplayed={5}
        prevPageText={"<"}
        nextPageText={">"}
        onChange={handleChangePage}
      />
    </div>
  );
};

export default NewsItem;
