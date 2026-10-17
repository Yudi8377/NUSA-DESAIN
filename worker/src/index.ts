interface Env {
  OPENAI_API_KEY: string
  FAL_KEY: string
  AI_STUDIO_ACCESS_CODE: string
  ALLOWED_ORIGIN?: string
  IMAGE_MODEL?: string
  FAL_VIDEO_MODEL?: string
}
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})
const safeError=(message:string)=>json({error:message},400)
const allowedModes=new Set(["concept","exterior","interior","video","presentation"])
const counters=new Map<string,{count:number;start:number}>()
function cors(response:Response,origin:string,env:Env){
 const allowed=env.ALLOWED_ORIGIN||"https://yudi8377.github.io"
 const headers=new Headers(response.headers)
 if(origin===allowed||origin===allowed+"/NUSA-DESAIN") {headers.set("access-control-allow-origin",origin);headers.set("vary","Origin")}
 headers.set("access-control-allow-methods","GET, POST, OPTIONS")
 headers.set("access-control-allow-headers","content-type, x-ai-studio-code")
 headers.set("access-control-max-age","86400")
 return new Response(response.body,{status:response.status,headers})
}
function limit(ip:string){
 const now=Date.now(), current=counters.get(ip)
 if(!current||now-current.start>60000){counters.set(ip,{count:1,start:now});return true}
 current.count++;return current.count<=5
}
export default {
 async fetch(request:Request,env:Env):Promise<Response>{
  const origin=request.headers.get("origin")||""
  if(request.method==="OPTIONS")return cors(new Response(null,{status:204}),origin,env)
  const url=new URL(request.url)
  if(url.pathname==="/api/health"&&request.method==="GET")return cors(json({ok:true,service:"nusa-design-ai",imageConfigured:Boolean(env.OPENAI_API_KEY),videoConfigured:Boolean(env.FAL_KEY&&env.FAL_VIDEO_MODEL),accessConfigured:Boolean(env.AI_STUDIO_ACCESS_CODE)}),origin,env)
  if(!["/api/generate","/api/generate/status"].includes(url.pathname))return cors(json({error:"Endpoint tidak ditemukan"},404),origin,env)
  const code=request.headers.get("x-ai-studio-code")||""
  if(!env.AI_STUDIO_ACCESS_CODE||code!==env.AI_STUDIO_ACCESS_CODE)return cors(json({error:"Kode akses Studio AI tidak valid atau belum dikonfigurasi."},401),origin,env)
  const ip=request.headers.get("cf-connecting-ip")||"unknown"
  if(!limit(ip))return cors(json({error:"Batas permintaan tercapai. Coba lagi satu menit kemudian."},429),origin,env)
  try{
   if(url.pathname==="/api/generate/status"&&request.method==="GET"){
    const id=url.searchParams.get("id")||""
    if(!/^[A-Za-z0-9_-]{8,160}$/.test(id))return cors(safeError("ID pekerjaan tidak valid."),origin,env)
    if(!env.FAL_KEY||!env.FAL_VIDEO_MODEL)return cors(json({error:"Penyedia video belum dikonfigurasi di server."},503),origin,env)
    const root="https://queue.fal.run/"+env.FAL_VIDEO_MODEL
    const statusRes=await fetch(root+"/requests/"+encodeURIComponent(id)+"/status",{headers:{authorization:"Key "+env.FAL_KEY}})
    if(!statusRes.ok)return cors(json({error:"Status pekerjaan video tidak dapat diambil dari penyedia."},502),origin,env)
    const status=await statusRes.json() as {status?:string}
    if(status.status!=="COMPLETED")return cors(json({status:status.status||"IN_PROGRESS"}),origin,env)
    const resultRes=await fetch(root+"/requests/"+encodeURIComponent(id),{headers:{authorization:"Key "+env.FAL_KEY}})
    if(!resultRes.ok)return cors(json({error:"Hasil video belum dapat diambil."},502),origin,env)
    const result=await resultRes.json() as {video?:{url?:string};output?:{video?:{url?:string}}}
    const videoUrl=result.video?.url||result.output?.video?.url
    if(!videoUrl)return cors(json({error:"Penyedia selesai tetapi tidak mengembalikan URL video yang dikenali."},502),origin,env)
    return cors(json({status:"COMPLETED",videoUrl}),origin,env)
   }
   if(request.method!=="POST")return cors(json({error:"Metode tidak didukung."},405),origin,env)
   const body=await request.json() as {mode?:string;prompt?:string;kind?:string}
   const mode=body.mode||""
   const prompt=(body.prompt||"").trim()
   if(!allowedModes.has(mode))return cors(safeError("Jenis keluaran tidak valid."),origin,env)
   if(!prompt||prompt.length>12000)return cors(safeError("Brief wajib diisi dan maksimal 12.000 karakter."),origin,env)
   if(mode==="video"){
    if(!env.FAL_KEY||!env.FAL_VIDEO_MODEL)return cors(json({error:"Penyedia video belum dikonfigurasi. Tambahkan FAL_KEY dan FAL_VIDEO_MODEL sebagai secret/variable server."},503),origin,env)
    const response=await fetch("https://queue.fal.run/"+env.FAL_VIDEO_MODEL,{method:"POST",headers:{"authorization":"Key "+env.FAL_KEY,"content-type":"application/json"},body:JSON.stringify({prompt,aspect_ratio:"16:9",duration:"5"})})
    const data=await response.json() as {request_id?:string;detail?:string;message?:string}
    if(!response.ok||!data.request_id)return cors(json({error:"Penyedia video menolak pekerjaan. Periksa model dan konfigurasi provider."},502),origin,env)
    return cors(json({status:"IN_PROGRESS",requestId:data.request_id}),origin,env)
   }
   if(!env.OPENAI_API_KEY)return cors(json({error:"Penyedia gambar belum dikonfigurasi. Tambahkan OPENAI_API_KEY sebagai secret server."},503),origin,env)
   const response=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"authorization":"Bearer "+env.OPENAI_API_KEY,"content-type":"application/json"},body:JSON.stringify({model:env.IMAGE_MODEL||"gpt-image-2.5-flare",prompt,n:1,size:"1536x1024",quality:"medium",output_format:"png"})})
   const data=await response.json() as {data?:Array<{b64_json?:string;url?:string;revised_prompt?:string}>;error?:{message?:string}}
   if(!response.ok)return cors(json({error:response.status===401?"Kredensial penyedia gambar ditolak. Periksa OPENAI_API_KEY.":response.status===429?"Kuota atau rate limit penyedia gambar tercapai.":"Penyedia gambar gagal memproses permintaan."},502),origin,env)
   const item=data.data?.[0]
   if(!item?.b64_json&&!item?.url)return cors(json({error:"Penyedia tidak mengembalikan gambar."},502),origin,env)
   return cors(json({status:"COMPLETED",imageData:item.b64_json?("data:image/png;base64,"+item.b64_json):undefined,imageUrl:item.url,revisedPrompt:item.revised_prompt}),origin,env)
  }catch{
   return cors(json({error:"Layanan generasi mengalami gangguan. Coba kembali; detail internal disembunyikan."},502),origin,env)
  }
 }
}
