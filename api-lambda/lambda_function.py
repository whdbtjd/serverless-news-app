import json
import boto3
import os
from boto3.dynamodb.conditions import Key

# DynamoDB 클라이언트 초기화
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # API Gateway에서 온 경로 및 메서드 정보 파싱
    path = event.get('path', '')
    http_method = event.get('httpMethod', 'GET')
    path_parameters = event.get('pathParameters', {}) or {}
    query_parameters = event.get('queryStringParameters', {}) or {}
    
    print(f"Path: {path}, Method: {http_method}")
    
    try:
        # 경로에 따른 처리
        if '/news/lists' in path:
            return get_all_news(query_parameters)
        
        elif '/news/science/lists' in path:
            return get_news_by_category('science', query_parameters)
        
        elif '/news/technology/lists' in path:
            return get_news_by_category('technology', query_parameters)
        
        elif '/news/business/lists' in path:
            return get_news_by_category('business', query_parameters)
        
        elif '/news/entertainment/lists' in path:
            return get_news_by_category('entertainment', query_parameters)
        
        elif '/news/general/lists' in path:
            return get_news_by_category('general', query_parameters)
        
        elif '/news/sports/lists' in path:
            return get_news_by_category('sports', query_parameters)
        
        # 특정 뉴스 기사 조회 (카테고리별)
        elif '/news/science/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'science')
        
        elif '/news/technology/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'technology')
        
        elif '/news/business/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'business')
        
        elif '/news/entertainment/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'entertainment')
        
        elif '/news/general/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'general')
        
        elif '/news/sports/' in path and not '/lists' in path:
            article_id = path.split('/')[-1]
            return get_news_article(article_id, 'sports')
        
        # 경로가 매칭되지 않는 경우
        return {
            'statusCode': 404,
            'body': json.dumps({'message': '요청한 리소스를 찾을 수 없습니다.'})
        }
    
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': '서버 오류가 발생했습니다.', 'error': str(e)})
        }

def get_all_news(query_params):
    """전체 뉴스 목록 조회"""
    try:
        # 정렬 기준 (기본: 최신순)
        sort_by = query_params.get('sort', 'date')
        
        # DynamoDB 스캔
        response = table.scan()
        items = response.get('Items', [])
        
        # 결과 정렬
        if sort_by == 'date':
            items.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
        
        # 결과 가공 (한국어 번역 버전만 제공)
        processed_items = []
        for item in items:
            processed_item = {
                'id': item.get('id'),
                'category': item.get('category'),
                'title': item.get('title_ko', ''),
                'description': item.get('description_ko', ''),
                'source': item.get('source'),
                'publishedAt': item.get('publishedAt'),
                'url': item.get('url'),
                'imageUrl': item.get('imageUrl')
            }
            
            processed_items.append(processed_item)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'count': len(processed_items),
                'news': processed_items
            })
        }
    
    except Exception as e:
        print(f"뉴스 목록 조회 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': '뉴스 목록 조회 중 오류가 발생했습니다.'})
        }

def get_news_by_category(category, query_params):
    """카테고리별 뉴스 목록 조회"""
    try:
        # 정렬 기준 (기본: 최신순)
        sort_by = query_params.get('sort', 'date')
        
        # DynamoDB 쿼리
        response = table.scan(
            FilterExpression=Key('category').eq(category)
        )
        items = response.get('Items', [])
        
        # 결과 정렬
        if sort_by == 'date':
            items.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
        
        # 결과 가공 (한국어 번역 버전만 제공)
        processed_items = []
        for item in items:
            processed_item = {
                'id': item.get('id'),
                'category': item.get('category'),
                'title': item.get('title_ko', ''),
                'description': item.get('description_ko', ''),
                'source': item.get('source'),
                'publishedAt': item.get('publishedAt'),
                'url': item.get('url'),
                'imageUrl': item.get('imageUrl')
            }
            
            processed_items.append(processed_item)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'category': category,
                'count': len(processed_items),
                'news': processed_items
            })
        }
    
    except Exception as e:
        print(f"{category} 카테고리 뉴스 조회 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': f'{category} 카테고리 뉴스 조회 중 오류가 발생했습니다.'})
        }

def get_news_article(article_id, category):
    """특정 뉴스 기사 조회"""
    try:
        # DynamoDB에서 특정 ID로 기사 조회
        response = table.get_item(
            Key={'id': article_id}
        )
        
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': '해당 기사를 찾을 수 없습니다.'})
            }
        
        # 카테고리 확인
        if item.get('category') != category:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': '해당 카테고리에 기사가 존재하지 않습니다.'})
            }
        
        # 한국어 버전의 기사 정보만 포함
        article_data = {
            'id': item.get('id'),
            'category': item.get('category'),
            'title': item.get('title_ko', ''),
            'description': item.get('description_ko', ''),
            'content': item.get('content_ko', ''),
            'source': item.get('source'),
            'publishedAt': item.get('publishedAt'),
            'url': item.get('url'),
            'imageUrl': item.get('imageUrl')
        }
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'article': article_data})
        }
    
    except Exception as e:
        print(f"기사 조회 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': '기사 조회 중 오류가 발생했습니다.'})
        }

def get_cors_headers():
    """CORS 헤더"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    }