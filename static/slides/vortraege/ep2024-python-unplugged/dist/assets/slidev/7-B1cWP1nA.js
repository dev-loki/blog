import{d as w,y as s,t as y,ac as x,aj as $,D as A,o as P,b as M,f as N,c as V,k as g,l as b,q as I,s as L,A as h,e as l}from"../modules/vue-CYnm540t.js";import{u as T,p as R,f as j}from"./context-vkjIvBb5.js";import{a as q,af as z,ag as k}from"../index-BrTcyACj.js";import{I as D}from"./center-BN1Cb9d7.js";import"../modules/shiki-B2WPnKC3.js";const E=["poster","controls"],F=w({__name:"SlidevVideo",props:{autoplay:{type:[Boolean,String]},autoreset:{},poster:{},printPoster:{},timestamp:{},printTimestamp:{},controls:{type:Boolean}},setup(p){const e=p,u=s(()=>e.printPoster??e.poster),r=s(()=>e.printTimestamp??e.timestamp??0),{$slidev:i,$renderContext:C,$route:c}=T(),{isPrintMode:S}=q(),n=s(()=>S.value||!["slide","presenter"].includes(C.value)),o=y(),m=y(!1);x(()=>{if(n.value)return;const a=+(e.timestamp??0);o.value.currentTime=a;const t=s(()=>!!c&&c.no===(i==null?void 0:i.nav.currentSlideNo)),d=s(()=>{var f,_;return!!o.value&&(((_=(f=z.get(o.value))==null?void 0:f.isShown)==null?void 0:_.value)??!0)}),v=$(t,d);A(v,()=>{v.value?(e.autoplay===!0||e.autoplay==="once"&&!m.value)&&o.value.play():(o.value.pause(),(e.autoreset==="click"||e.autoreset==="slide"&&!t.value)&&(o.value.currentTime=a))},{immediate:!0})});function B(a){const t=a.target;n.value&&(!u.value||e.printTimestamp)&&(t.currentTime=r.value==="last"?t.duration:+r.value)}return(a,t)=>(P(),M("video",{ref_key:"video",ref:o,poster:n.value?u.value:e.poster,controls:!n.value&&e.controls,onPlay:t[0]||(t[0]=d=>m.value=!0),onLoadedmetadata:B},[N(a.$slots,"default")],40,E))}}),G="/slides/vortraege/ep2024-python-unplugged/book-streaming.mp4",H=l("source",{src:G,type:"video/mp4"},null,-1),J=l("p",null,[l("small",null,[l("i",null," * I actually created a full (vanilla python) server and generator to generate those books - And we most likely won’t even see nor use it -.-’ ")])],-1),X={__name:"7",setup(p){return R(k),T(),(e,u)=>{const r=F;return P(),V(D,I(L(h(j)(h(k),6))),{default:g(()=>[b(r,{autoplay:"",autoreset:""},{default:g(()=>[H]),_:1}),J]),_:1},16)}}};export{X as default};