import json
import math
import re
from functools import lru_cache
from ..db import get_conn, now
from ..config import RAG_USE_EMBEDDINGS, RAG_TOP_K, GEMINI_EMBEDDING_MODEL, EMBEDDING_DIM


def _tokens(text):
    return re.findall(r"[a-zA-Z0-9_]+", (text or "").lower())

def _cosine(a, b):
    if not a or not b: return 0.0
    n=min(len(a),len(b)); dot=sum(a[i]*b[i] for i in range(n))
    na=math.sqrt(sum(x*x for x in a[:n])); nb=math.sqrt(sum(x*x for x in b[:n]))
    return dot/(na*nb) if na and nb else 0.0

def _fingerprint(text): return " ".join((text or "").split()).lower()

def _lexical_score(query,text):
    q=_tokens(query); t=_tokens(text)
    if not q or not t: return 0.0
    counts={}
    for tok in t: counts[tok]=counts.get(tok,0)+1
    score=0.0
    for tok in set(q):
        if tok in counts: score += 1.0 + min(2.0, math.log1p(counts[tok]))
    return score/max(1.0,math.sqrt(len(set(q))))

@lru_cache(maxsize=256)
def _embed_query(query):
    if not RAG_USE_EMBEDDINGS: return []
    try:
        from ..services.gemini_service import _client
        client=_client(); result=client.models.embed_content(model=GEMINI_EMBEDDING_MODEL, contents=query, config={"output_dimensionality":EMBEDDING_DIM})
        return list(result.embeddings[0].values)
    except Exception: return []

def add_chunks(chunks):
    if not chunks: return 0
    conn=get_conn(); conn.execute('PRAGMA foreign_keys=ON')
    inserted=0
    try:
        for c in chunks:
            source=c.get('source','').strip(); text=c.get('text','').strip()
            if not text or not source: continue
            material_id='mat_'+__import__('hashlib').sha256(source.encode()).hexdigest()[:24]
            conn.execute('INSERT OR IGNORE INTO materials(id,source,created_at) VALUES(?,?,?)',(material_id,source,now()))
            fp=_fingerprint(text)
            exists=conn.execute('SELECT 1 FROM rag_chunks WHERE material_id=? AND lower(replace(text, char(10), " "))=? LIMIT 1',(material_id,fp)).fetchone()
            if exists: continue
            emb=[]
            if RAG_USE_EMBEDDINGS:
                try:
                    from ..services.gemini_service import _client
                    client=_client(); r=client.models.embed_content(model=GEMINI_EMBEDDING_MODEL, contents=text, config={"output_dimensionality":EMBEDDING_DIM}); emb=list(r.embeddings[0].values)
                except Exception: emb=[]
            cid=c.get('id') or 'chunk_'+__import__('hashlib').sha256((source+'|'+text).encode()).hexdigest()[:24]
            conn.execute('INSERT OR IGNORE INTO rag_chunks(id,material_id,source,page,text,embedding_json,created_at) VALUES(?,?,?,?,?,?,?)',(cid,material_id,source,str(c.get('page') or ''),text,json.dumps(emb),now()))
            inserted += 1
        conn.commit()
    finally: conn.close()
    _embed_query.cache_clear(); return inserted

def search(query, top_k=None):
    query=(query or '').strip(); top_k=top_k or RAG_TOP_K
    if not query: return []
    conn=get_conn(); rows=conn.execute('SELECT id,source,page,text,embedding_json FROM rag_chunks').fetchall(); conn.close()
    if not rows: return []
    items=[dict(r) for r in rows]
    lexical=sorted(((_lexical_score(query,x['text']),x) for x in items), key=lambda z:z[0], reverse=True)
    candidates=[x for _,x in lexical[:max(30,top_k*10)]]
    top_lex=lexical[0][0] if lexical else 0
    qv=_embed_query(query) if RAG_USE_EMBEDDINGS and top_lex<0.75 else []
    scored=[]
    for item in candidates:
        lex=_lexical_score(query,item['text']); emb=[]
        try: emb=json.loads(item.get('embedding_json') or '[]')
        except Exception: pass
        sem=_cosine(qv,emb) if qv and emb else 0
        score=0.78*sem+0.22*min(1,lex) if qv else lex
        scored.append((score,item))
    scored.sort(key=lambda z:z[0], reverse=True)
    return [{'score':round(float(score),4),'source':item['source'],'page':item.get('page') or None,'text':item['text'][:1800]} for score,item in scored[:top_k]]

def count():
    conn=get_conn(); n=conn.execute('SELECT COUNT(*) FROM rag_chunks').fetchone()[0]; conn.close(); return n
