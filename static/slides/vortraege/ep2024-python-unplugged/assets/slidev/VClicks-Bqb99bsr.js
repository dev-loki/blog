import{aC as x,aD as C,aE as z}from"../index-BrTcyACj.js";import{d as S,ac as I,aD as B,o as D,c as V,F as $,aA as w,v as a,aE as f,aF as E,l as M,aa as F}from"../modules/vue-CYnm540t.js";import{u as G}from"./context-vkjIvBb5.js";const L=S({__name:"VClickGap",props:{size:{type:[String,Number],default:1}},setup(d){const s=d,{$clicksContext:i}=G(),p=x();let o=+s.size;return Number.isNaN(o)&&(console.warn(`[slidev] Invalid size for VClickGap: ${s.size}`),o=1),I(()=>{const l=i.currentOffset+o-1;i.register(p,{max:l,delta:o})}),B(()=>{i.unregister(p)}),(l,r)=>(D(),V($))}}),b=["ul","ol"],U=S({props:{depth:{type:[Number,String],default:1},every:{type:[Number,String],default:1},at:{type:[Number,String],default:"+1"},hide:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},handleSpecialElements:{type:Boolean,default:!0}},render(){var N,g;const d=+this.every,s=C(this.at),i=typeof s=="string";if(!s){console.warn("[slidev] Invalid at prop for v-clicks component:",s);return}const p=w("click"),o=(n,e)=>F(n,[[p,e,"",{hide:this.hide,fade:this.fade}]]),l=n=>n.flatMap(e=>f(e)&&typeof e.type=="symbol"&&Array.isArray(e.children)?l(e.children):[e]);let r=(g=(N=this.$slots).default)==null?void 0:g.call(N);if(!r)return;r=l(z(r));const _=(n,e=1)=>l(n).map(t=>{if(!f(t))return t;if(b.includes(t.type)&&Array.isArray(t.children)){const c=u(t.children,e+1);return a(t,{},c)}return a(t)});let A=1,h=0;const u=(n,e=1)=>l(n).map(t=>{if(!f(t)||t.type===E)return t;const c=+s+Math.ceil(A++/d)-1;let m;e<+this.depth&&Array.isArray(t.children)?m=a(t,{},_(t.children,e)):m=a(t);const v=c-h;return h=c,o(m,i?v>=0?`+${v}`:`${v}`:c)}),y=()=>M(L,{size:+s+Math.ceil((A-1)/d)-1-h});if(this.handleSpecialElements){if(r.length===1&&b.includes(r[0].type)&&Array.isArray(r[0].children))return a(r[0],{},[...u(r[0].children),y()]);if(r.length===1&&r[0].type==="table"){const n=r[0];if(Array.isArray(n.children))return a(n,{},n.children.map(e=>f(e)?e.type==="tbody"&&Array.isArray(e.children)?a(e,{},[...u(e.children),y()]):a(e):e))}}return[...u(r),y()]}});export{U as _};