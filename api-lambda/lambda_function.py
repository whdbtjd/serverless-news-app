import json
import boto3
import os

# DynamoDB 클라이언트 초기화
dynamodb = boto3.client('dynamodb') # resource 대신 client 사용이 구조 파싱에 용이
table_name = os.environ.get('DYNAMODB_TABLE')

def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', 'GET')
    
    print(f"Path: {path}, Method: {http_method}")
    
    try:
        query_parameters = event.get('queryStringParameters', {}) or {}
        
        # 경로에 따른 처리
        if '/news/lists' in path:
            return get_all_news()
        
        categories = ['science', 'technology', 'business', 'entertainment', 'general', 'sports']
        for cat in categories:
            if f'/news/{cat}/lists' in path:
                return get_news_by_category(cat)
            if f'/news/{cat}/' in path and not '/lists' in path:
                article_id = path.split('/')[-1]
                return get_news_article(article_id, cat)
        
        return {
            'statusCode': 404,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': '요청한 리소스를 찾을 수 없습니다.'})
        }
    
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return error_response(f"서버 오류: {str(e)}")

def get_all_news():
    try:
        response = dynamodb.scan(TableName=table_name)
        items = response.get('Items', [])
        
        # 날짜순 정렬 (publishedAt.S 값을 기준으로 정렬)
        items.sort(key=lambda x: x.get('publishedAt', {}).get('S', ''), reverse=True)
        
        processed_items = [format_db_item(item) for item in items]
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'count': len(processed_items), 'news': processed_items})
        }
    except Exception as e:
        return error_response(str(e))

def get_news_by_category(category):
    try:
        # Scan 시 FilterExpression 사용
        response = dynamodb.scan(
            TableName=table_name,
            FilterExpression='#cat = :cat_val',
            ExpressionAttributeNames={'#cat': 'category'},
            ExpressionAttributeValues={':cat_val': {'S': category}}
        )
        items = response.get('Items', [])
        items.sort(key=lambda x: x.get('publishedAt', {}).get('S', ''), reverse=True)
        
        processed_items = [format_db_item(item) for item in items]
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'category': category, 'count': len(processed_items), 'news': processed_items})
        }
    except Exception as e:
        return error_response(str(e))

def get_news_article(article_id, category):
    try:
        response = dynamodb.get_item(
            TableName=table_name,
            Key={'id': {'S': article_id}}
        )
        item = response.get('Item')
        
        if not item or item.get('category', {}).get('S') != category:
            return {'statusCode': 404, 'headers': get_cors_headers(), 'body': json.dumps({'message': '기사를 찾을 수 없습니다.'})}
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'article': format_db_item(item, True)})
        }
    except Exception as e:
        return error_response(str(e))

def format_db_item(item, include_content=False):
    """DynamoDB의 {"S": "값"} 구조를 일반 문자열로 변환하는 함수"""
    
    # 헬퍼 함수: 필드 존재 여부 확인 후 값 추출
    def get_val(field_name, default=''):
        field_data = item.get(field_name, {})
        # 문자열(S) 또는 숫자(N) 타입 대응
        return field_data.get('S') or field_data.get('N') or default

    # 한국어 필드가 우선, 없으면 영어 필드 사용
    title = get_val('title_ko') or get_val('title', 'No Title')
    desc = get_val('description_ko') or get_val('description')
    
    data = {
        'id': get_val('id'),
        'category': get_val('category'),
        'title': title,
        'description': desc,
        'source': get_val('source'),
        'publishedAt': get_val('publishedAt'),
        'url': get_val('url'),
        'imageUrl': get_val('imageUrl')
    }
    
    if include_content:
        data['content'] = get_val('content_ko') or get_val('content')
        
    return data

def get_cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    }

def error_response(message):
    return {
        'statusCode': 500,
        'headers': get_cors_headers(),
        'body': json.dumps({'message': message}) 
    }