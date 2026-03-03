import sys
import subprocess
import os
import json
import boto3
import requests
import time
import uuid
import re
from datetime import datetime

# 필요한 패키지 설치 함수
def install_trafilatura():
    if not os.path.exists("/tmp/trafilatura"):
        print("첫 실행: trafilatura 설치 중...")
        install_cmd = [sys.executable, "-m", "pip", "install", "trafilatura", "-t", "/tmp/"]
        subprocess.check_call(install_cmd)
        sys.path.insert(0, '/tmp/')
        print("trafilatura 설치 완료")

# DynamoDB 클라이언트 초기화
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    # trafilatura 설치 및 임포트
    install_trafilatura()
    import trafilatura
    
    api_key = os.environ.get("NEWS_API_KEY")
    table_name = os.environ.get("DYNAMODB_TABLE")
    
    table = dynamodb.Table(table_name)
    
    url = "https://newsapi.org/v2/top-headlines"
    
    # 카테고리 목록 확장
    categories = ["business", "entertainment", "general", "science", "sports", "technology"]
    
    all_articles = []
    
    for category in categories:
        params = {
            "category": category,
            "language": "en",
            "pageSize": 3,
            "apiKey": api_key
        }
        
        try:
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                print(f"{category} 카테고리에서 {len(articles)}개 기사 가져옴")
                
                for article in articles:
                    article_url = article.get('url')
                    
                    # 기사 본문 추출
                    try:
                        downloaded = trafilatura.fetch_url(article_url)
                        full_content = trafilatura.extract(downloaded, output_format='txt')
                    except Exception as e:
                        print(f"본문 추출 오류: {str(e)}")
                        full_content = "본문 추출 실패"
                    
                    # 고유 ID
                    article_id = f"{category}-{uuid.uuid4()}"
                    
                    current_time = int(datetime.now().timestamp())
                    expiry_time = current_time + 259200  # 3일
                    
                    # 번역 없이 원문 그대로 저장
                    item = {
                        'id': article_id,
                        'category': category,
                        'title': article.get('title', ''),
                        'source': article.get('source', {}).get('name', ''),
                        'description': article.get('description', ''),
                        'url': article_url,
                        'imageUrl': article.get('urlToImage', ''),
                        'publishedAt': article.get('publishedAt', ''),
                        'content': full_content if full_content else '',
                        'timestamp': current_time,
                        'ttl': expiry_time
                    }
                    
                    table.put_item(Item=item)
                    
                    all_articles.append({
                        'id': article_id,
                        'title': article.get('title', ''),
                        'category': category
                    })
                    
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
