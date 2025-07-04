// app/api/broadcasting/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 1) 获取原始表单 body (socket_id=...&channel_name=...)
    const body = await req.text()
    console.log('Broadcasting auth request body:', body)

    // 2) 提取前端带来的请求头中的 Cookie 和 CSRF Token
    const cookie = req.headers.get('cookie') || ''
    // 从请求头或 cookies 中获取 XSRF token
    const csrfHeader = req.headers.get('x-xsrf-token')
    const csrfCookie = req.cookies.get('XSRF-TOKEN')?.value
    const csrfToken = csrfHeader || csrfCookie || ''
    // 获取 Authorization header
    const authHeader = req.headers.get('authorization') || ''

    console.log('Broadcasting auth headers:', {
      authHeader: authHeader ? 'Present' : 'Missing',
      cookie: cookie ? 'Present' : 'Missing',
      csrfToken: csrfToken ? 'Present' : 'Missing'
    })

    // 3) 构造 Laravel 后端广播授权 URL
    const laravelUrl = 'http://localhost:8000'

    // 4) 转发请求给 Laravel，包括 Cookie 和 CSRF token
    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': authHeader,
    }
    
    // 只有当 CSRF token 存在时才添加
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }
    
    const laravelRes = await fetch(`${laravelUrl}/broadcasting/auth`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    })

    // 5) 读取并解析响应
    const text = await laravelRes.text()
    console.log('Laravel response status:', laravelRes.status)
    console.log('Laravel response text:', text)
    
    let data: any
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Laravel auth response not JSON:', text)
      return NextResponse.json({ error: 'Invalid auth response' }, { status: 502 })
    }

    if (!laravelRes.ok) {
      console.error('Laravel broadcast auth failed:', {
        status: laravelRes.status,
        data: data,
        headers: Object.fromEntries(laravelRes.headers.entries())
      })
      return NextResponse.json({ error: 'Auth failed', details: data }, { status: laravelRes.status })
    }

    // 6) 返回成功结果给前端 Echo
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-XSRF-TOKEN, Authorization',
      }
    })
  } catch (err) {
    console.error('Proxy error in broadcasting auth route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 处理 OPTIONS 请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-XSRF-TOKEN, Authorization',
    },
  })
}
