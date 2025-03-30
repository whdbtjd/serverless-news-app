import sys
import subprocess
import os
import json
import boto3
import requests
import time
import uuid
from datetime import datetime

# 필요한 패키지 설치 함수
def install_trafilatura():
    if not os.path.exists("/tmp/trafilatura"):
        install_cmd = [sys.executable, "-m", "pip", "install", "trafilatura", "-t", "/tmp/"]
        subprocess.check_call(install_cmd)
        # /tmp 경로를 Python 경로에 추가
        sys.path.insert(0, '/tmp/')
        print("trafilatura 설치 완료")

# DynamoDB 클라이언트 초기화
dynamodb = boto3.resource('dynamodb')
# Amazon Translate 클라이언트 초기화
translate_client = boto3.client('translate')

def lambda_handler(event, context):
    # trafilatura 설치 및 임포트
    install_trafilatura()
    import trafilatura
    
    # 환경 변수에서 API 키와 테이블 이름 가져오기
    api_key = os.environ.get("NEWS_API_KEY")
    table_name = os.environ.get("DYNAMODB_TABLE")
    
    # DynamoDB 테이블
    table = dynamodb.Table(table_name)
    
    # NewsAPI 엔드포인트 URL
    url = "https://newsapi.org/v2/top-headlines"
    
    # 카테고리 목록
    categories = ["technology", "business", "science", "health"]
    
    all_articles = []
    
    for category in categories:
        # 파라미터 설정
        params = {
            "category": category,
            "language": "en",
            "pageSize": 10,
            "apiKey": api_key
        }
        
        try:
            # API 요청 보내기
            response = requests.get(url, params=params)
            
            # 응답 확인
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                print(f"{category} 카테고리에서 {len(articles)}개 기사 가져옴")
                
                # 각 기사 처리
                for article in articles:
                    article_url = article.get('url')
                    
                    # 기사 본문 추출
                    try:
                        downloaded = trafilatura.fetch_url(article_url)
                        full_content = trafilatura.extract(downloaded, output_format='txt')
                        
                        # 제목과 설명 번역 (영어 -> 한국어)
                        title_ko = ""
                        description_ko = ""
                        content_ko = ""
                        
                        # 제목 번역
                        if article.get('title'):
                            try:
                                title_response = translate_client.translate_text(
                                    Text=article.get('title', ''),
                                    SourceLanguageCode='en',
                                    TargetLanguageCode='ko'
                                )
                                title_ko = title_response.get('TranslatedText', '')
                            except Exception as e:
                                print(f"제목 번역 오류: {str(e)}")
                        
                        # 설명 번역
                        if article.get('description'):
                            try:
                                description_response = translate_client.translate_text(
                                    Text=article.get('description', ''),
                                    SourceLanguageCode='en',
                                    TargetLanguageCode='ko'
                                )
                                description_ko = description_response.get('TranslatedText', '')
                            except Exception as e:
                                print(f"설명 번역 오류: {str(e)}")
                        
                        # 본문 번역
                        if full_content:
                            try:
                                # Amazon Translate는 한 번에 최대 5,000자까지 처리 가능
                                # 긴 텍스트는 청크로 분할하여 번역
                                chunks = split_text(full_content, 4500)  # 4500자로 제한
                                translated_chunks = []
                                
                                for chunk in chunks:
                                    chunk_response = translate_client.translate_text(
                                        Text=chunk,
                                        SourceLanguageCode='en',
                                        TargetLanguageCode='ko'
                                    )
                                    translated_chunks.append(chunk_response.get('TranslatedText', ''))
                                
                            
                                content_ko = ' '.join(translated_chunks)
                            except Exception as e:
                                print(f"본문 번역 오류: {str(e)}")
                    except Exception as e:
                        print(f"본문 추출 오류: {str(e)}")
                        full_content = "본문 추출 실패"
                    
                    # 고유 ID 생성
                    article_id = f"{category}-{uuid.uuid4()}"
                    
                    # 현재 시간 (TTL용)
                    current_time = int(datetime.now().timestamp())
                    # 3일 후 만료 (259200초 = 3일)
                    expiry_time = current_time + 259200
                    
                    # DynamoDB에 저장할 항목 (번역 내용 포함)
                    item = {
                        'id': article_id,
                        'category': category,
                        'title': article.get('title', ''),
                        'title_ko': title_ko,  # 한국어 제목
                        'source': article.get('source', {}).get('name', ''),
                        'description': article.get('description', ''),
                        'description_ko': description_ko,  # 한국어 설명
                        'url': article_url,
                        'imageUrl': article.get('urlToImage', ''),
                        'publishedAt': article.get('publishedAt', ''),
                        'content': full_content if full_content else '',
                        'content_ko': content_ko,  # 한국어 본문
                        'timestamp': current_time,
                        'ttl': expiry_time
                    }
                    
                    # DynamoDB에 저장
                    table.put_item(Item=item)
                    
                    # 처리한 기사 목록에 추가
                    all_articles.append({
                        'id': article_id,
                        'title': article.get('title', ''),
                        'title_ko': title_ko,
                        'category': category
                    })
                    
                    # 너무 많은 요청 방지
                    time.sleep(1)
            else:
                print(f"API 오류: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"처리 중 오류 발생: {str(e)}")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f"{len(all_articles)}개 기사 처리 완료",
            'articles': all_articles
        })
    }

def split_text(text, max_length):
    """
    긴 텍스트를 지정된 최대 길이로 분할하는 함수
    
    Args:
        text (str): 분할할 텍스트
        max_length (int): 각 청크의 최대 길이
    
    Returns:
        list: 텍스트 청크 리스트
    """
    # 텍스트가 비어있거나 최대 길이보다 짧으면 바로 반환
    if not text or len(text) <= max_length:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        # 최대 길이를 초과하지 않는 지점까지 자르기
        end = start + max_length
        
        # 최대 길이보다 텍스트가 더 길면 문장 끝으로 자르기
        if end < len(text):
            # 문장 끝(마침표, 물음표, 느낌표 등) 찾기
            sentence_end = max(
                text.rfind('. ', start, end),
                text.rfind('? ', start, end),
                text.rfind('! ', start, end),
                text.rfind('\n', start, end)
            )
            
            # 문장 끝을 찾지 못하면 단어 경계로 자르기
            if sentence_end == -1:
                sentence_end = text.rfind(' ', start, end)
            
            # 단어 경계도 찾지 못하면 그냥 최대 길이로 자르기
            if sentence_end == -1 or sentence_end <= start:
                end = end
            else:
                end = sentence_end + 1  # 문장 끝 포함
        
        chunks.append(text[start:end])
        start = end
    
    return chunks