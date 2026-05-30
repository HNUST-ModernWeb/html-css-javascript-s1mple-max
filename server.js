const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8088;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// In-memory database
let users = [];
let posts = [];
let comments = [];
let likes = [];
let nextUserId = 1;
let nextPostId = 1;
let nextCommentId = 1;

// Ensure upload directory
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Simple token: base64(userId:username:hash)
function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username })).toString('base64');
}

function parseToken(token) {
  try {
    if (!token || !token.startsWith('Bearer ')) return null;
    return JSON.parse(Buffer.from(token.slice(7), 'base64').toString());
  } catch { return null; }
}

function getUserId(req) {
  const auth = req.headers['authorization'] || '';
  const payload = parseToken(auth);
  return payload ? payload.id : null;
}

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };
}

function json(res, data, status = 200) {
  res.writeHead(status, { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function readMultipart(req, boundary) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const result = { fields: {}, file: null };

      const boundaryBuf = Buffer.from('--' + boundary);
      const crlf = Buffer.from('\r\n');
      const doubleCrlf = Buffer.from('\r\n\r\n');

      // Find all boundary positions
      let pos = 0;
      const boundaryPositions = [];
      while (true) {
        const idx = buffer.indexOf(boundaryBuf, pos);
        if (idx === -1) break;
        boundaryPositions.push(idx);
        pos = idx + boundaryBuf.length;
      }

      for (let i = 0; i < boundaryPositions.length - 1; i++) {
        const partStart = boundaryPositions[i] + boundaryBuf.length;
        // Skip the trailing crlf after boundary
        let dataStart = partStart;
        if (buffer[dataStart] === 0x0d && buffer[dataStart + 1] === 0x0a) dataStart += 2;

        const partEnd = boundaryPositions[i + 1];
        // Remove trailing crlf before next boundary
        let dataEnd = partEnd;
        if (dataEnd > dataStart && buffer[dataEnd - 2] === 0x0d && buffer[dataEnd - 1] === 0x0a) dataEnd -= 2;

        const partBuf = buffer.slice(dataStart, dataEnd);
        if (partBuf.length === 0) continue;

        // Find header/body separator
        const headerEnd = partBuf.indexOf(doubleCrlf);
        if (headerEnd === -1) continue;

        const headerStr = partBuf.slice(0, headerEnd).toString();
        const bodyBuf = partBuf.slice(headerEnd + 4);

        const nameMatch = headerStr.match(/name="([^"]+)"/);
        const filenameMatch = headerStr.match(/filename="([^"]+)"/);

        if (nameMatch) {
          const name = nameMatch[1];
          if (filenameMatch) {
            // Trim trailing crlf from file body
            let fileBody = bodyBuf;
            if (fileBody.length >= 2 && fileBody[fileBody.length - 2] === 0x0d && fileBody[fileBody.length - 1] === 0x0a) {
              fileBody = fileBody.slice(0, fileBody.length - 2);
            }
            result.file = { name: filenameMatch[1], data: fileBody };
            result.fields[name] = filenameMatch[1];
          } else {
            result.fields[name] = bodyBuf.toString().trim();
          }
        }
      }

      resolve(result);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  const method = req.method;
  const pathname = url.pathname;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  // Serve uploaded files
  if (pathname.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_DIR, pathname.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      json(res, { code: 404, message: 'File not found' }, 404);
    }
    return;
  }

  try {
    // ===== Auth =====
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await readBody(req);
      if (!body.username || !body.password || !body.nickname) return json(res, { code: 400, message: '请填写完整信息' }, 400);
      if (users.find(u => u.username === body.username)) return json(res, { code: 400, message: '用户名已存在' }, 400);

      const user = { id: nextUserId++, username: body.username, password: hashPassword(body.password), nickname: body.nickname, avatar: '', bio: '', createdAt: new Date().toISOString() };
      users.push(user);
      const token = generateToken(user);
      return json(res, { code: 200, message: 'success', data: { token, user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio } } });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readBody(req);
      const user = users.find(u => u.username === body.username);
      if (!user || user.password !== hashPassword(body.password)) return json(res, { code: 400, message: '用户名或密码错误' }, 400);

      const token = generateToken(user);
      return json(res, { code: 200, message: 'success', data: { token, user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio } } });
    }

    // ===== Posts =====
    if (pathname === '/api/posts' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page')) || 1;
      const size = parseInt(url.searchParams.get('size')) || 10;
      const offset = (page - 1) * size;
      const currentUserId = getUserId(req);

      const enriched = posts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + size)
        .map(p => {
          const author = users.find(u => u.id === p.userId);
          const likeCount = likes.filter(l => l.postId === p.id).length;
          const liked = currentUserId ? likes.some(l => l.postId === p.id && l.userId === currentUserId) : false;
          return { ...p, nickname: author?.nickname || 'Unknown', avatar: author?.avatar || '', likeCount, liked };
        });

      return json(res, { code: 200, message: 'success', data: enriched });
    }

    if (pathname === '/api/posts' && method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);

      const body = await readBody(req);
      if (!body.content) return json(res, { code: 400, message: '内容不能为空' }, 400);

      const author = users.find(u => u.id === userId);
      if (!author) return json(res, { code: 401, message: '用户不存在，请重新登录' }, 401);
      const post = { id: nextPostId++, userId, content: body.content, image: body.image || '', createdAt: new Date().toISOString() };
      posts.push(post);
      return json(res, { code: 200, message: 'success', data: { ...post, nickname: author.nickname, avatar: author.avatar, likeCount: 0, liked: false } });
    }

    const postDeleteMatch = pathname.match(/^\/api\/posts\/(\d+)$/);
    if (postDeleteMatch && method === 'DELETE') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const postId = parseInt(postDeleteMatch[1]);
      const idx = posts.findIndex(p => p.id === postId && p.userId === userId);
      if (idx === -1) return json(res, { code: 403, message: '无权删除或帖子不存在' }, 403);
      posts.splice(idx, 1);
      comments = comments.filter(c => c.postId !== postId);
      likes = likes.filter(l => l.postId !== postId);
      return json(res, { code: 200, message: 'success', data: null });
    }

    const postDetailMatch = pathname.match(/^\/api\/posts\/(\d+)$/);
    if (postDetailMatch && method === 'GET') {
      const postId = parseInt(postDetailMatch[1]);
      const post = posts.find(p => p.id === postId);
      if (!post) return json(res, { code: 404, message: '帖子不存在' }, 404);

      const author = users.find(u => u.id === post.userId);
      const currentUserId = getUserId(req);
      const likeCount = likes.filter(l => l.postId === postId).length;
      const liked = currentUserId ? likes.some(l => l.postId === postId && l.userId === currentUserId) : false;
      return json(res, { code: 200, message: 'success', data: { ...post, nickname: author?.nickname, avatar: author?.avatar, likeCount, liked } });
    }

    // ===== Likes =====
    const likeMatch = pathname.match(/^\/api\/posts\/(\d+)\/like$/);
    if (likeMatch && method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const postId = parseInt(likeMatch[1]);
      const existing = likes.find(l => l.postId === postId && l.userId === userId);
      if (existing) {
        likes = likes.filter(l => !(l.postId === postId && l.userId === userId));
        return json(res, { code: 200, message: 'success', data: { liked: false } });
      } else {
        likes.push({ id: Date.now(), postId, userId });
        return json(res, { code: 200, message: 'success', data: { liked: true } });
      }
    }

    // ===== Comments =====
    const commentsListMatch = pathname.match(/^\/api\/posts\/(\d+)\/comments$/);
    if (commentsListMatch && method === 'GET') {
      const postId = parseInt(commentsListMatch[1]);
      const postComments = comments
        .filter(c => c.postId === postId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(c => {
          const author = users.find(u => u.id === c.userId);
          return { ...c, nickname: author?.nickname || 'Unknown', avatar: author?.avatar || '' };
        });
      return json(res, { code: 200, message: 'success', data: postComments });
    }

    if (commentsListMatch && method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const postId = parseInt(commentsListMatch[1]);
      const body = await readBody(req);
      if (!body.content) return json(res, { code: 400, message: '评论不能为空' }, 400);

      const comment = { id: nextCommentId++, postId, userId, content: body.content, createdAt: new Date().toISOString() };
      comments.push(comment);
      const author = users.find(u => u.id === userId);
      return json(res, { code: 200, message: 'success', data: { ...comment, nickname: author.nickname, avatar: author.avatar } });
    }

    const commentDeleteMatch = pathname.match(/^\/api\/comments\/(\d+)$/);
    if (commentDeleteMatch && method === 'DELETE') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const commentId = parseInt(commentDeleteMatch[1]);
      const idx = comments.findIndex(c => c.id === commentId && c.userId === userId);
      if (idx === -1) return json(res, { code: 403, message: '无权删除或评论不存在' }, 403);
      comments.splice(idx, 1);
      return json(res, { code: 200, message: 'success', data: null });
    }

    // ===== Users =====
    if (pathname === '/api/users/me' && method === 'GET') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const user = users.find(u => u.id === userId);
      if (!user) return json(res, { code: 404, message: '用户不存在' }, 404);
      return json(res, { code: 200, message: 'success', data: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt } });
    }

    if (pathname === '/api/users/me' && method === 'PUT') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);
      const body = await readBody(req);
      const user = users.find(u => u.id === userId);
      if (body.nickname !== undefined) user.nickname = body.nickname;
      if (body.bio !== undefined) user.bio = body.bio;
      return json(res, { code: 200, message: 'success', data: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio } });
    }

    const userProfileMatch = pathname.match(/^\/api\/users\/(\d+)$/);
    if (userProfileMatch && method === 'GET') {
      const profileUserId = parseInt(userProfileMatch[1]);
      const user = users.find(u => u.id === profileUserId);
      if (!user) return json(res, { code: 404, message: '用户不存在' }, 404);

      const currentUserId = getUserId(req);
      const userPosts = posts
        .filter(p => p.userId === profileUserId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20)
        .map(p => {
          const likeCount = likes.filter(l => l.postId === p.id).length;
          const liked = currentUserId ? likes.some(l => l.postId === p.id && l.userId === currentUserId) : false;
          return { ...p, nickname: user.nickname, avatar: user.avatar, likeCount, liked };
        });

      return json(res, { code: 200, message: 'success', data: {
        id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt, posts: userPosts
      }});
    }

    // ===== Upload =====
    if (pathname === '/api/upload/image' && method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return json(res, { code: 401, message: '请先登录' }, 401);

      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) return json(res, { code: 400, message: 'Invalid upload' }, 400);

      const parsed = await readMultipart(req, boundaryMatch[1]);
      if (!parsed.file) return json(res, { code: 400, message: '文件为空' }, 400);

      const ext = path.extname(parsed.file.name) || '.png';
      const filename = crypto.randomUUID() + ext;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), parsed.file.data);

      return json(res, { code: 200, message: 'success', data: { url: '/uploads/' + filename } });
    }

    // 404
    json(res, { code: 404, message: 'Not found' }, 404);

  } catch (err) {
    console.error(err);
    json(res, { code: 500, message: 'Server error' }, 500);
  }
});

server.listen(PORT, () => {
  console.log('Backend server running at http://localhost:' + PORT);
  console.log('API endpoints: /api/auth/*, /api/posts/*, /api/users/*, /api/upload/*');
});
