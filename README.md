# crawling_and_wordcloud

* 크롤링
BeautifulSoup와 네이버 검색 API를 활용한 뉴스 데이터 크롤링
크롤링 데이터 csv 파일로 생성

* 워드 클라우드
konlpy 활용하여 형태소 분석 후 키워드 추출
마스크 이미지와 좌표 마다 텍스트 색깔 지정
wordcloud 이미지 생성

* 필요한 테이블
CREATE TABLE `news` (
`idx` int NOT NULL AUTO_INCREMENT,
`image_url` text NOT NULL,
`title` varchar(255) NOT NULL,
`url` varchar(255) NOT NULL,
`views` int DEFAULT NULL,
`isLiked` tinyint(1) DEFAULT NULL,
`pubDate` datetime NOT NULL,
PRIMARY KEY (`idx`)
);
