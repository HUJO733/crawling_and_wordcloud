from konlpy.tag import Okt # 한글 자연어 처리 라이브러리 / Okt : 트위터에서 개발한 형태소 분석기
from collections import Counter # 텍스트 데이터에서 각 단어의 빈도수 계산
from wordcloud import WordCloud # 텍스트 데이터에서 단어의 빈도수를 기반으로 워드클라우드를 생성
import matplotlib.pyplot as plt # 워드클라우드를 시각화하기 위해 사용되는 라이브러리
import pandas as pd # CSV 파일 등의 형태로 저장된 텍스트 데이터를 불러오고 다루기 위해 사용
import numpy as np
from PIL import Image # 이미지 처리를 위한 라이브러리

okt = Okt() 
word_list = []    

# csv파일 읽어오기(원하는 크롤링 결과 읽어오기)
newsList = pd.read_csv("news_data.csv", delimiter='|', encoding="utf-8-sig")

# 각 행의 'title' 열을 개별적으로 처리
for title in newsList['title']:
    # 형태소 분석 작업을 진행
    for word, tag in okt.pos(title):
        # 명사와 형용사만 추출
        if tag in ['Noun', 'Adjective'] and len(word) > 1:
            # 조건을 만족하는 단어들만 word_list 데이터셋에 추가
            word_list.append(word)
            
            
# 각 행의 'content' 열을 개별적으로 처리
for content in newsList['content']:
    # 형태소 분석 작업을 진행
    for word, tag in okt.pos(str(content)):
        # 명사와 형용사만 추출
        if tag in ['Noun', 'Adjective'] and len(word) > 1:
            # 조건을 만족하는 단어들만 word_list 데이터셋에 추가
            word_list.append(word)

# 동일 단어 횟수 추출
word_list_count = Counter(word_list) # 각 단어의 빈도수 추출 후 딕셔너리 형태로 저장
total_word_count = sum(word_list_count.values()) # 딕셔너리의 값들을 모두 합해서 총 단어 등장 횟수 계산npm 
print(word_list_count)
print(total_word_count)

# 마스크가 될 이미지 불러오기
icon = Image.open('./earth.png') # 사용할 이미지를 변수에 할당

mask = Image.new("RGB", icon.size, (255,255,255))
mask.paste(icon,icon) # icon 이미지를 새로 생성한 mask에 붙임
mask = np.array(mask) # mask를 numpy배열로 변환

# 좌표마다 글자 색 설정
def color_func(word, font_size, position, random_state=None, **kwargs):
    x, y = position
    if (44 <= x <= 144 and 16 <= y <= 232) \
        or (62 <= x <= 128 and 232 <= y <= 283) \
        or (144 <= x <= 181 and 23 <= y <= 196) \
        or (181 <= x <= 196 and 40 <= y <= 177) \
        or (196 <= x <= 223 and 54 <= y <= 132) \
        or (223 <= x <= 243 and 80 <= y <= 136) \
        or (243 <= x <= 265 and 112 <= y <= 153) \
        or (265 <= x <= 343 and 130 <= y <= 237) \
        or (276 <= x <= 386 and 237 <= y <= 268) \
        or (290 <= x <= 365 and 268 <= y <= 291) \
        or (343 <= x <= 363 and 152 <= y <= 237) \
        or (363 <= x <= 410 and 177 <= y <= 257) \
        or (410 <= x <= 473 and 193 <= y <= 237) \
        or (81 <= x <= 133 and 375 <= y <= 393) \
        or (68 <= x <= 140 and 393 <= y) \
        or (140 <= x <= 173 and 456 <= y) \
        or (173 <= x <= 207 and 352 <= y) \
        or (207 <= x <= 272 and 335 <= y) \
        or (272 <= x <= 288 and 365 <= y) \
        or (288 <= x <= 415 and 424 <= y):
        return "hsl(120, 100%, {}%)".format(np.random.randint(40, 70))  # 초록색 계열 (채도 100%)
    else:
        return "hsl(210, 100%, {}%)".format(np.random.randint(40, 70))  # 파란색 계열 (채도 100%)

# 워드클라우드 객체 선언 및 출력
wc =  WordCloud(font_path='malgun', width=400, height=400, background_color='RGB(238, 244, 253)', mask=mask, color_func=color_func)
result = wc.generate_from_frequencies(word_list_count)
plt.imshow(result)
wc.to_file("result.png") # png 파일로 저장